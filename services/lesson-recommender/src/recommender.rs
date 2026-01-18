use crate::models::{NodeMetadata, NodeScore, RecommendRequest, UserProfile};
use std::collections::HashSet;

pub struct Recommender;

impl Recommender {
    /// Rank candidate nodes based on user profile and history
    pub fn rank_candidates(
        request: &RecommendRequest,
        nodes_metadata: &[NodeMetadata],
    ) -> Vec<NodeScore> {
        let mut scored_nodes: Vec<NodeScore> = nodes_metadata
            .iter()
            .map(|node| {
                let mut score = NodeScore::new(node.node_id.clone());
                
                // Calculate age fit score
                score.age_fit = Self::calculate_age_fit(request.age, &node.age_range);
                
                // Calculate difficulty match if profile exists
                if let Some(ref profile) = request.profile {
                    score.difficulty_match = Self::calculate_difficulty_match(
                        profile.level,
                        node.difficulty.unwrap_or(1),
                    );
                    
                    score.topic_preference = Self::calculate_topic_preference(
                        &node.lesson_key,
                        &profile.preferred_topics,
                    );
                } else {
                    score.difficulty_match = 0.5; // Neutral
                    score.topic_preference = 0.5; // Neutral
                }
                
                // Calculate repetition spacing
                score.repetition_spacing = Self::calculate_repetition_spacing(
                    &node.lesson_key,
                    &request.history,
                );
                
                // Check prerequisites
                score.prerequisite_met = Self::check_prerequisites(
                    &node.prerequisites,
                    &request.history,
                );
                
                // Calculate total weighted score
                score.calculate_total_score();
                
                score
            })
            .collect();
        
        // Sort by score descending
        scored_nodes.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());
        
        scored_nodes
    }
    
    /// Calculate how well the user's age fits the node's age range
    /// Returns 0.0-1.0 where 1.0 is perfect fit
    fn calculate_age_fit(age: i32, age_range: &[i32]) -> f64 {
        if age_range.len() != 2 {
            return 0.0;
        }
        
        let min_age = age_range[0];
        let max_age = age_range[1];
        
        if age < min_age || age > max_age {
            // Outside range, sharp penalty
            return 0.0;
        }
        
        // Within range, check how centered
        let range_size = (max_age - min_age) as f64;
        let midpoint = (min_age + max_age) as f64 / 2.0;
        let distance_from_center = ((age as f64) - midpoint).abs();
        
        // Closer to center = higher score
        let normalized_distance = distance_from_center / (range_size / 2.0);
        1.0 - (normalized_distance * 0.2) // Max 20% penalty for being at edge
    }
    
    /// Calculate difficulty match
    /// Returns 0.0-1.0 where 1.0 is perfect match
    fn calculate_difficulty_match(user_level: i32, node_difficulty: i32) -> f64 {
        let diff = (user_level - node_difficulty).abs();
        
        match diff {
            0 => 1.0,                    // Perfect match
            1 => 0.8,                    // One level off, still good
            2 => 0.6,                    // Two levels, acceptable
            3 => 0.4,                    // Three levels, less ideal
            _ => 0.2,                    // Far off, low score
        }
    }
    
    /// Calculate topic preference score
    /// Returns 0.0-1.0 based on whether the lesson matches preferred topics
    fn calculate_topic_preference(lesson_key: &str, preferred_topics: &[String]) -> f64 {
        if preferred_topics.is_empty() {
            return 0.5; // Neutral if no preferences
        }
        
        // Check if lesson key contains any preferred topic
        for topic in preferred_topics {
            if lesson_key.contains(topic) {
                return 1.0; // High score for matching preference
            }
        }
        
        0.3 // Low but not zero for non-matching topics
    }
    
    /// Calculate repetition spacing score
    /// Penalizes recently completed similar lessons
    /// Returns 0.0-1.0 where 1.0 means no recent repetition
    fn calculate_repetition_spacing(lesson_key: &str, history: &[String]) -> f64 {
        if history.is_empty() {
            return 1.0; // No history, no repetition concern
        }
        
        // Check how recently this lesson type was seen
        // Looking at last 5 nodes for repetition
        let recent_history: Vec<&String> = history.iter().rev().take(5).collect();
        
        for (index, node_id) in recent_history.iter().enumerate() {
            if node_id.contains(lesson_key) {
                // Found in recent history
                // More recent = lower score
                let recency_penalty = 1.0 - (index as f64 / 5.0);
                return recency_penalty;
            }
        }
        
        1.0 // Not found in recent history, good spacing
    }
    
    /// Check if all prerequisites are met
    fn check_prerequisites(prerequisites: &[String], history: &[String]) -> bool {
        if prerequisites.is_empty() {
            return true; // No prerequisites
        }
        
        let history_set: HashSet<&String> = history.iter().collect();
        
        // All prerequisites must be in history
        prerequisites.iter().all(|prereq| history_set.contains(prereq))
    }
    
    /// Generate a human-readable rationale for the recommendation
    pub fn generate_rationale(score: &NodeScore, age: i32) -> String {
        let mut reasons = Vec::new();
        
        if score.age_fit > 0.8 {
            reasons.push(format!("age-appropriate for {}", age));
        }
        
        if score.difficulty_match > 0.8 {
            reasons.push("matches your skill level".to_string());
        }
        
        if score.topic_preference > 0.8 {
            reasons.push("covers a topic you enjoy".to_string());
        }
        
        if score.repetition_spacing > 0.8 {
            reasons.push("introduces a fresh concept".to_string());
        }
        
        if !score.prerequisite_met {
            reasons.push("requires completing other lessons first".to_string());
        }
        
        if reasons.is_empty() {
            "balanced learning path".to_string()
        } else {
            reasons.join(", ")
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_age_fit_perfect() {
        let score = Recommender::calculate_age_fit(10, &vec![8, 12]);
        assert!(score > 0.9); // Should be very high
    }

    #[test]
    fn test_age_fit_outside_range() {
        let score = Recommender::calculate_age_fit(15, &vec![8, 12]);
        assert_eq!(score, 0.0); // Should be zero
    }

    #[test]
    fn test_age_fit_at_edge() {
        let score = Recommender::calculate_age_fit(8, &vec![8, 12]);
        assert!(score >= 0.8); // Should still be high
    }

    #[test]
    fn test_difficulty_match_perfect() {
        let score = Recommender::calculate_difficulty_match(5, 5);
        assert_eq!(score, 1.0);
    }

    #[test]
    fn test_difficulty_match_one_off() {
        let score = Recommender::calculate_difficulty_match(5, 6);
        assert_eq!(score, 0.8);
    }

    #[test]
    fn test_topic_preference_match() {
        let topics = vec!["saving".to_string(), "budgeting".to_string()];
        let score = Recommender::calculate_topic_preference("saving_basics", &topics);
        assert_eq!(score, 1.0);
    }

    #[test]
    fn test_topic_preference_no_match() {
        let topics = vec!["saving".to_string()];
        let score = Recommender::calculate_topic_preference("investing_basics", &topics);
        assert_eq!(score, 0.3);
    }

    #[test]
    fn test_repetition_spacing_no_history() {
        let score = Recommender::calculate_repetition_spacing("saving", &vec![]);
        assert_eq!(score, 1.0);
    }

    #[test]
    fn test_repetition_spacing_recent() {
        let history = vec![
            "node_1_saving".to_string(),
            "node_2_budgeting".to_string(),
            "node_3_saving".to_string(), // Recent saving
        ];
        let score = Recommender::calculate_repetition_spacing("saving", &history);
        assert!(score < 1.0); // Should penalize recent repetition
    }

    #[test]
    fn test_check_prerequisites_met() {
        let prerequisites = vec!["node_1".to_string(), "node_2".to_string()];
        let history = vec!["node_1".to_string(), "node_2".to_string(), "node_3".to_string()];
        let met = Recommender::check_prerequisites(&prerequisites, &history);
        assert!(met);
    }

    #[test]
    fn test_check_prerequisites_not_met() {
        let prerequisites = vec!["node_1".to_string(), "node_2".to_string()];
        let history = vec!["node_1".to_string()]; // Missing node_2
        let met = Recommender::check_prerequisites(&prerequisites, &history);
        assert!(!met);
    }

    #[test]
    fn test_node_score_calculation() {
        let mut score = NodeScore::new("test_node".to_string());
        score.age_fit = 1.0;
        score.difficulty_match = 0.8;
        score.topic_preference = 1.0;
        score.repetition_spacing = 0.6;
        score.prerequisite_met = true;
        
        score.calculate_total_score();
        
        // Weighted average: 0.4*1.0 + 0.2*0.8 + 0.2*1.0 + 0.2*0.6
        let expected = 0.4 + 0.16 + 0.2 + 0.12;
        assert!((score.score - expected).abs() < 0.01);
    }

    #[test]
    fn test_node_score_with_unmet_prerequisites() {
        let mut score = NodeScore::new("test_node".to_string());
        score.age_fit = 1.0;
        score.difficulty_match = 1.0;
        score.topic_preference = 1.0;
        score.repetition_spacing = 1.0;
        score.prerequisite_met = false; // Not met
        
        score.calculate_total_score();
        
        // Should be halved due to unmet prerequisites
        assert!(score.score < 0.6);
    }
}
