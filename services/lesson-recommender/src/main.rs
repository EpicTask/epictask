mod models;
mod recommender;

use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use log::info;
use models::{HealthResponse, NodeMetadata, RecommendRequest, RecommendResponse};
use recommender::Recommender;
use std::env;

/// Health check endpoint
async fn health() -> impl Responder {
    HttpResponse::Ok().json(HealthResponse {
        status: "healthy".to_string(),
        service: "lesson-recommender".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

/// Root endpoint
async fn root() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "service": "Lesson Recommender",
        "version": env!("CARGO_PKG_VERSION"),
        "description": "Rule-based story node recommender for ages 5-18",
        "endpoints": {
            "health": "/health",
            "recommend": "POST /recommend"
        }
    }))
}

/// Recommend endpoint - main recommendation logic
async fn recommend(req: web::Json<RecommendRequest>) -> impl Responder {
    info!("Recommend request for user: {}, story: {}", req.user_id, req.story_id);
    
    // For Phase 1, we'll use a simple mock metadata approach
    // In Phase 2, this could query Firestore for actual node metadata
    let nodes_metadata = create_mock_metadata_for_candidates(&req.candidate_nodes);
    
    // Rank candidates
    let scored_nodes = Recommender::rank_candidates(&req, &nodes_metadata);
    
    if scored_nodes.is_empty() {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "No suitable nodes found"
        }));
    }
    
    // Get top recommendation
    let top_score = &scored_nodes[0];
    let confidence = top_score.score;
    let rationale = Recommender::generate_rationale(top_score, req.age);
    
    info!(
        "Recommended node: {} with confidence: {:.2}",
        top_score.node_id, confidence
    );
    
    HttpResponse::Ok().json(RecommendResponse {
        next_node_id: top_score.node_id.clone(),
        confidence,
        rationale: Some(rationale),
    })
}

/// Create mock metadata for candidate nodes
/// In Phase 2, this would query Firestore
fn create_mock_metadata_for_candidates(candidate_nodes: &[String]) -> Vec<NodeMetadata> {
    candidate_nodes
        .iter()
        .map(|node_id| {
            // Extract lesson key from node_id (e.g., "node_2_saving" -> "saving")
            let lesson_key = node_id
                .split('_')
                .last()
                .unwrap_or("general")
                .to_string();
            
            // Infer age range from node_id or use default
            let age_range = if node_id.contains("young") || node_id.contains("start") {
                vec![5, 10]
            } else if node_id.contains("teen") || node_id.contains("advanced") {
                vec![13, 18]
            } else {
                vec![8, 14] // Default middle range
            };
            
            // Infer difficulty from node order (higher numbers = harder)
            let difficulty = node_id
                .split('_')
                .find_map(|part| part.parse::<i32>().ok())
                .map(|num| num / 2 + 1) // Convert node number to difficulty level
                .or(Some(1));
            
            NodeMetadata {
                node_id: node_id.clone(),
                lesson_key,
                age_range,
                difficulty,
                prerequisites: vec![], // Could be enhanced in Phase 2
            }
        })
        .collect()
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logger
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    
    // Get port from environment or default to 8081
    let port = env::var("PORT")
        .unwrap_or_else(|_| "8081".to_string())
        .parse::<u16>()
        .expect("PORT must be a valid number");
    
    info!("Starting Lesson Recommender service on port {}", port);
    
    HttpServer::new(|| {
        App::new()
            .route("/", web::get().to(root))
            .route("/health", web::get().to(health))
            .route("/recommend", web::post().to(recommend))
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test, App};
    use models::{UserProfile};

    #[actix_web::test]
    async fn test_health_endpoint() {
        let app = test::init_service(
            App::new().route("/health", web::get().to(health))
        ).await;
        
        let req = test::TestRequest::get().uri("/health").to_request();
        let resp: HealthResponse = test::call_and_read_body_json(&app, req).await;
        
        assert_eq!(resp.status, "healthy");
        assert_eq!(resp.service, "lesson-recommender");
    }

    #[actix_web::test]
    async fn test_recommend_endpoint() {
        let app = test::init_service(
            App::new().route("/recommend", web::post().to(recommend))
        ).await;
        
        let profile = UserProfile {
            user_id: "user_123".to_string(),
            age: 10,
            level: 2,
            preferred_topics: vec!["saving".to_string()],
            completed_lessons: vec![],
        };
        
        let request = RecommendRequest {
            user_id: "user_123".to_string(),
            age: 10,
            story_id: "story_1".to_string(),
            current_node_id: "node_1".to_string(),
            history: vec!["node_1".to_string()],
            candidate_nodes: vec![
                "node_2_saving".to_string(),
                "node_2_spending".to_string(),
            ],
            profile: Some(profile),
        };
        
        let req = test::TestRequest::post()
            .uri("/recommend")
            .set_json(&request)
            .to_request();
        
        let resp: RecommendResponse = test::call_and_read_body_json(&app, req).await;
        
        assert!(!resp.next_node_id.is_empty());
        assert!(resp.confidence >= 0.0 && resp.confidence <= 1.0);
        assert!(resp.rationale.is_some());
    }
}
