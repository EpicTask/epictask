use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserProfile {
    pub user_id: String,
    pub age: i32,
    pub level: i32,
    pub preferred_topics: Vec<String>,
    pub completed_lessons: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RecommendRequest {
    pub user_id: String,
    pub age: i32,
    pub story_id: String,
    pub current_node_id: String,
    pub history: Vec<String>,
    pub candidate_nodes: Vec<String>,
    pub profile: Option<UserProfile>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RecommendResponse {
    pub next_node_id: String,
    pub confidence: f64,
    pub rationale: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NodeMetadata {
    pub node_id: String,
    pub lesson_key: String,
    pub age_range: Vec<i32>,
    pub difficulty: Option<i32>,
    pub prerequisites: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NodeScore {
    pub node_id: String,
    pub score: f64,
    pub age_fit: f64,
    pub difficulty_match: f64,
    pub topic_preference: f64,
    pub repetition_spacing: f64,
    pub prerequisite_met: bool,
}

impl NodeScore {
    pub fn new(node_id: String) -> Self {
        Self {
            node_id,
            score: 0.0,
            age_fit: 0.0,
            difficulty_match: 0.0,
            topic_preference: 0.0,
            repetition_spacing: 0.0,
            prerequisite_met: true,
        }
    }

    pub fn calculate_total_score(&mut self) {
        // Weighted scoring: age_fit is most important
        let weights = [
            (self.age_fit, 0.4),
            (self.difficulty_match, 0.2),
            (self.topic_preference, 0.2),
            (self.repetition_spacing, 0.2),
        ];

        let mut total = 0.0;
        for (score, weight) in weights.iter() {
            total += score * weight;
        }

        // Prerequisite penalty
        if !self.prerequisite_met {
            total *= 0.5;
        }

        self.score = total;
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HealthResponse {
    pub status: String,
    pub service: String,
    pub version: String,
}
