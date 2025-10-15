import { IReq, IRes } from '@src/routes/common/types';
import { Router } from 'express';
import DeepSeekService from '@src/services/DeepSeekService';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { sendSuccess } from '@src/common/util/response';

const router = Router();

/**
 * @swagger
 * /api/chat/message:
 *   post:
 *     summary: Send a message to holaBot (DeepSeek AI)
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: User message
 *                 example: "I want to find a room near Tan Xa lake"
 *               userId:
 *                 type: string
 *                 description: User ID (optional)
 *                 example: "user123"
 *             required:
 *               - message
 *     responses:
 *       200:
 *         description: Response from AI bot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Chat processed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     response:
 *                       type: string
 *                       example: "I found 3 rooms near Tan Xa lake..."
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Message is required"
 *       500:
 *         description: Server error
 */
async function sendMessage(req: IReq, res: IRes): Promise<void> {
  try {
    const { message, userId, conversation_history } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Message is required and must be a non-empty string",
      });
      return;
    }

    // Limit message length
    if (message.length > 1000) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Message is too long. Maximum 1000 characters allowed.",
      });
      return;
    }

    // Prepare message to send to DeepSeek
    let enhancedMessage = message.trim();
    
    // If there is conversation history, add it to the message
    if (conversation_history && typeof conversation_history === 'string') {
      // Limit conversation history length
      let processedHistory = conversation_history;
      if (processedHistory.length > 5000) {
        processedHistory = processedHistory.slice(-5000); // Get last 5000 characters
      }
      
      // Add conversation history to the message with a clearer format
      enhancedMessage = `### RECENT CONVERSATION HISTORY ###\n${processedHistory}\n\n###
       CURRENT MESSAGE ###\n${enhancedMessage}\n\n### NOTES ###
       \nPlease read the conversation history carefully to understand the 
       context and respond to the current message. If the user mentions 
       "this room", "that room", etc., please search in the history to 
       know which room/apartment they are referring to.`;
      
    }

    // Call DeepSeek service to process the message
    const validUserId = typeof userId === 'string' ? userId : undefined;
    const response = await DeepSeekService.processMessage(enhancedMessage, validUserId);

    sendSuccess(res, "Chat processed successfully", {
      response: response,
      timestamp: new Date().toISOString(),
      originalMessage: message.trim(),
    });

  } catch (error) {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
}

/**
 * @swagger
 * /api/chat/health:
 *   get:
 *     summary: Check the health of the chat service
 *     tags: [Chat]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Chat service is healthy"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "OK"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */

// Test route for debugging
router.get('/test', (req: IReq, res: IRes) => {
  res.json({ message: "Chat routes working!", timestamp: new Date().toISOString() });
});

// Export routes
router.post('/message', sendMessage);

export default router; 