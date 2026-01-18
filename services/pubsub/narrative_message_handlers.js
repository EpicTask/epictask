/**
 * Message handlers for Adaptive Narrative Engine events
 */

/**
 * Handle narrative progress event
 * @param {Object} message - Pub/Sub message data
 */
export async function handleNarrativeProgress(message) {
  try {
    console.log('Processing narrative progress event:', message.event_id);
    
    const {
      user_id,
      story_id,
      from_node,
      to_node,
      xp_awarded,
      age,
      correlation_id
    } = message;
    
    // Log to analytics (could be BigQuery, etc.)
    console.log(`User ${user_id} advanced from ${from_node} to ${to_node} in story ${story_id}`);
    console.log(`XP awarded: ${xp_awarded}, Age: ${age}`);
    
    // TODO: Send notification to parent if milestone reached
    // TODO: Update real-time dashboards
    // TODO: Trigger recommendations update
    
    return { success: true, message: 'Progress event processed' };
  } catch (error) {
    console.error('Error handling narrative progress:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle story completion event
 * @param {Object} message - Pub/Sub message data
 */
export async function handleNarrativeCompleted(message) {
  try {
    console.log('Processing story completion event:', message.event_id);
    
    const {
      user_id,
      story_id,
      final_node,
      total_xp,
      completion_time_seconds
    } = message;
    
    console.log(`User ${user_id} completed story ${story_id}!`);
    console.log(`Total XP: ${total_xp}, Time: ${completion_time_seconds}s`);
    
    // TODO: Award completion badge
    // TODO: Send celebration notification to user and parent
    // TODO: Update user stats/achievements
    // TODO: Recommend next story
    
    return { success: true, message: 'Completion event processed' };
  } catch (error) {
    console.error('Error handling story completion:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle payout requested event
 * @param {Object} message - Pub/Sub message data
 */
export async function handlePayoutRequested(message) {
  try {
    console.log('Processing payout requested event:', message.event_id);
    
    const {
      user_id,
      request_id,
      wallet_address,
      token,
      amount,
      reason,
      story_id,
      node_id
    } = message;
    
    console.log(`Payout requested: ${amount} ${token} to ${wallet_address}`);
    console.log(`Reason: ${reason}, Request ID: ${request_id}`);
    
    // TODO: Send notification to parent about payout request
    // TODO: Track payout metrics for monitoring
    // TODO: Alert if unusual pattern detected (fraud prevention)
    
    return { success: true, message: 'Payout request event processed' };
  } catch (error) {
    console.error('Error handling payout requested:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle payout confirmed event
 * @param {Object} message - Pub/Sub message data
 */
export async function handlePayoutConfirmed(message) {
  try {
    console.log('Processing payout confirmed event:', message.event_id);
    
    const {
      user_id,
      request_id,
      transaction_hash,
      amount,
      token
    } = message;
    
    console.log(`Payout confirmed: ${amount} ${token}`);
    console.log(`Transaction: ${transaction_hash}`);
    
    // TODO: Send success notification to parent
    // TODO: Update user notification in app
    // TODO: Record for audit trail
    // TODO: Update payout analytics
    
    return { success: true, message: 'Payout confirmed event processed' };
  } catch (error) {
    console.error('Error handling payout confirmed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Route narrative events to appropriate handlers
 * @param {Object} pubsubMessage - Raw Pub/Sub message
 * @returns {Promise<Object>} Handler result
 */
export async function handleNarrativeEvent(pubsubMessage) {
  try {
    // Decode message data
    const data = Buffer.from(pubsubMessage.data, 'base64').toString();
    const message = JSON.parse(data);
    
    console.log(`Received narrative event: ${message.event_id}`);
    console.log(`Service: ${message.service}, User: ${message.user_id}`);
    
    // Route to appropriate handler based on message structure
    if (message.story_id && message.from_node && message.to_node) {
      return await handleNarrativeProgress(message);
    } else if (message.story_id && message.final_node && message.total_xp) {
      return await handleNarrativeCompleted(message);
    } else if (message.request_id && message.wallet_address && message.reason) {
      if (message.transaction_hash) {
        return await handlePayoutConfirmed(message);
      } else {
        return await handlePayoutRequested(message);
      }
    }
    
    console.warn('Unknown narrative event type:', message);
    return { success: false, error: 'Unknown event type' };
    
  } catch (error) {
    console.error('Error processing narrative event:', error);
    return { success: false, error: error.message };
  }
}
