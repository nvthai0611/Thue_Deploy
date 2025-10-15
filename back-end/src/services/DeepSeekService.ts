
/* eslint-disable */
import OpenAI from 'openai';
import { HousingAreaStatus } from '@src/common/constants';
import { RoomStatus } from '@src/common/constants';

// Simple in-memory cache for search results
const searchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Cache helper functions
const getCacheKey = (type: string, params: any) => {
  return `${type}:${JSON.stringify(params)}`;
};

const getFromCache = (key: string) => {
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  searchCache.delete(key);
  return null;
};

const setCache = (key: string, data: any) => {
  searchCache.set(key, { data, timestamp: Date.now() });
  
  // Clean up old cache entries if cache gets too large
  if (searchCache.size > 100) {
    const oldestKey = searchCache.keys().next().value;
    if (oldestKey) searchCache.delete(oldestKey);
  }
};

// Initialize DeepSeek client with optimized settings
const deepSeek = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
  timeout: 10000, // Reduce to 10 seconds timeout
  maxRetries: 1, // Reduce retries for faster response
});

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

class DeepSeekService {
  /**
   * Provide information about Hola Rental and usage instructions
   */
  private static async getHolaRentalInfo({ topic }: { topic: string }) {
    let response = "I cannot provide detailed information on this topic.";

    if (topic === "general") {
      response = `Hola Rental is a platform connecting landlords and tenants in Hoa Lac - Thach That - Ha Noi. We provide the following services:
- Search for rooms with smart filters by price, area, amenities.
- Identity verification with FPT eKYC technology to ensure safety for both landlords and tenants.
- Direct chat with landlords to learn more about rooms.
- Sign electronic contracts to protect the rights of both parties.
- Online payment via ZaloPay for convenience and safety.
- Contract management and dispute resolution.

You can access the website at https://hola-rental-client.onrender.com/ to search for rooms and start renting immediately.`;
    } else if (topic === "user_features") {
      response = `For tenants, you can:
- Register an account with your phone number to become a member of Hola Rental.
- Verify your identity by uploading your ID card via the FPT eKYC system.
- Search for rooms by location, price, area, amenities.
- Chat with landlords to learn more about rooms and book rooms.
- View room details, including price, photos, address, amenities, status.
- Sign electronic contracts and pay online.
- Manage contracts and resolve disputes.

To register a tenant account on Hola Rental:
1. Visit the website at https://hola-rental-client.onrender.com/
2. Select "Register" and enter your phone number
3. Enter the OTP verification code sent to your phone
4. Fill in basic personal information
5. (Optional) Verify your identity by uploading your ID card via FPT eKYC to increase reliability and unlock advanced features`;
    } else if (topic === "landlord_features") {
      response = `To register as a landlord on Hola Rental, follow these steps:

1. On the header bar, click the **Register Landlord** button (red, with a plus icon).
2. Step 1: Property Document
   - Click **Add image** to upload images of the property document.
   - Enter the title in the **Title** field (placeholder: 'Enter a descriptive title').
   - Enter the description in the **Description** field (placeholder: 'Enter a descriptive description').
   - After filling in all information and uploading images, click **Next** to proceed.
3. Step 2: Identification Information
   - Verify personal information (ID card, phone number, bank account).
   - If missing phone number or bank account, click **Click here to update phone** or **Click here to update bank** to add.
   - If not verified, the system will notify **Please verify your account first**.
   - After verification, click **Submit**.
4. Step 3: Housing Area Information
   - Enter the housing area name in the **Name** field.
   - Enter the address in the **Address** field.
   - Enter the district in the **District** field.
   - Enter the city in the **City** field.
   - Enter the expected number of rooms in the **Expected Rooms** field.
   - Enter the description in the **Description** field.
   - Upload legal documents by clicking **Add image**.
   - After filling in all information, click **Submit**.
5. Step 4: Room Information
   - Enter the room title in the **Title** field.
   - Enter the room number in the **Room Number** field.
   - Enter the price in the **Price** field.
   - Enter the area in the **Area** field.
   - Select the room type (Single or Couple) in the **Type** field.
   - Enter the maximum occupancy in the **Max Occupancy** field.
   - Enter the description in the **Description** field.
   - Upload room images by clicking **Add image**.
   - Select amenities by clicking on the amenity icons.
   - After filling in all information, click **Submit**.

After completing all steps, your housing area and room will be submitted for admin approval. Once approved, your room will be available for tenants to search and book.`;
    } else if (topic === "verification") {
      response = `Hola Rental uses FPT eKYC technology for identity verification to ensure safety for both landlords and tenants.

For tenants:
- Identity verification is optional but recommended to increase reliability and unlock advanced features.
- You can verify your identity by uploading your ID card via the FPT eKYC system.
- The verification process is quick and secure.

For landlords:
- Identity verification is required to register as a landlord.
- You need to verify your ID card, phone number, and bank account.
- This ensures that only legitimate landlords can list their properties on the platform.

The verification process helps protect both landlords and tenants from fraud and ensures a safe rental experience.`;
    } else if (topic === "payment") {
      response = `Hola Rental integrates with ZaloPay for secure online payments.

Payment process:
- Tenants can pay rent and deposits online through ZaloPay.
- Payments are processed securely and quickly.
- Both landlords and tenants receive confirmation of payment.
- Payment history is maintained for record-keeping.

Benefits of online payment:
- Convenience: No need to carry cash or visit banks.
- Security: All transactions are encrypted and secure.
- Speed: Payments are processed instantly.
- Record-keeping: All payment history is maintained.

To make a payment:
1. Select the room you want to rent.
2. Click on the "Rent" button.
3. Review the contract details.
4. Click "Sign Contract" to proceed to payment.
5. Choose ZaloPay as your payment method.
6. Complete the payment process.

Integrated with the payment system.`;
    } else if (topic === "contract") {
      response = `Hola Rental provides electronic contract signing for secure and convenient rental agreements.

Contract features:
- Electronic contracts are legally binding.
- Contracts are automatically generated based on room and tenant information.
- Both landlords and tenants can sign contracts electronically.
- Contract terms are clearly defined and protect both parties.

Contract process:
1. Tenant selects a room and clicks "Rent".
2. System generates an electronic contract.
3. Tenant reviews and signs the contract.
4. Landlord receives notification and can sign the contract.
5. Once both parties sign, the contract is active.
6. Tenant can proceed with payment.

Contract management:
- Both parties can view contract details at any time.
- Contract status is clearly displayed.
- Dispute resolution process is available if needed.

Dispute resolution process:
1. Submit a support request.
2. Mediation.
3. Evidence storage.
4. Transparent resolution process.`;
    }

    return {
      success: true,
      topic: topic,
      response: response,
    };
  }

  /**
   * Handle chat message with DeepSeek AI
   */
  public static async processMessage(message: string, userId?: string): Promise<string> {
    try {
      // Optimize: Use minimal tools based on message content for faster response
      let tools = [];
      
      // Add tools based on message content to reduce prompt size
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('trọ') || lowerMessage.includes('khu') || lowerMessage.includes('area')) {
        tools.push({
          type: "function" as const,
          function: {
            name: "search_housing_areas",
            description: "Search housing areas by location",
            parameters: {
              type: "object",
              properties: {
                location: { type: "string", description: "Location to search" },
                page: { type: "number", default: 1 },
                pageSize: { type: "number", default: 3 },
              },
              required: ["location"],
            },
          },
        });
      }
      
      if (lowerMessage.includes('phòng') || lowerMessage.includes('room') || lowerMessage.includes('giá') || lowerMessage.includes('tiền')) {
        tools.push({
          type: "function" as const,
          function: {
            name: "search_rooms",
            description: "Search rooms with filters",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Search term" },
                room_number: { type: "string", description: "Room number" },
                minPrice: { type: "number", description: "Min price" },
                maxPrice: { type: "number", description: "Max price" },
                minArea: { type: "number", description: "Min area" },
                maxArea: { type: "number", description: "Max area" },
                type: { type: "string", enum: ["SINGLE", "COUPLE"] },
                page: { type: "number", default: 1 },
                limit: { type: "number", default: 3 },
              },
            },
          },
        });
      }
      
      if (lowerMessage.includes('tương tự') || lowerMessage.includes('similar')) {
        tools.push({
          type: "function" as const,
          function: {
            name: "find_similar_rooms",
            description: "Find similar rooms",
            parameters: {
              type: "object",
              properties: {
                roomId: { type: "string", description: "Room ID" },
                limit: { type: "number", default: 3 },
              },
              required: ["roomId"],
            },
          },
        });
      }
      
      if (lowerMessage.includes('thông tin') || lowerMessage.includes('info') || lowerMessage.includes('hướng dẫn')) {
        tools.push({
          type: "function" as const,
          function: {
            name: "get_hola_rental_info",
            description: "Get platform info",
            parameters: {
              type: "object",
              properties: {
                topic: {
                  type: "string",
                  enum: ["general", "user_features", "landlord_features", "verification", "payment", "contract", "all"],
                },
              },
              required: ["topic"],
            },
          },
        });
      }
      
      if (lowerMessage.includes('danh sách') || lowerMessage.includes('list') || lowerMessage.includes('bao nhiêu')) {
        tools.push({
          type: "function" as const,
          function: {
            name: "get_rooms_by_housing_area",
            description: "Get rooms by housing area",
            parameters: {
              type: "object",
              properties: {
                housingAreaId: { type: "string", description: "Housing area ID" },
              },
              required: ["housingAreaId"],
            },
          },
        });
      }
      
      // If no specific tools needed, add basic ones
      if (tools.length === 0) {
        tools = [
          {
            type: "function" as const,
            function: {
              name: "search_rooms",
              description: "Search rooms",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Search term" },
                  limit: { type: "number", default: 3 },
                },
              },
            },
          }
        ];
      }

      // Optimize: Use shorter system prompt based on message type
      let systemPrompt = "You are holaBot - AI assistant of HolaRental. Respond in Vietnamese, friendly and concise.";

      // Add specific rules based on message content
      if (lowerMessage.includes('phòng') && !lowerMessage.includes('R')) {
        systemPrompt += "\n\nCRITICAL: If user searches for 'phòng' without room ID starting with 'R', respond: 'Xin lỗi, để tìm kiếm phòng cụ thể, bạn vui lòng nhập ID phòng bắt đầu bằng chữ R (ví dụ: R7429, R101). Nếu bạn muốn tìm khu trọ, vui lòng nhập tên khu trọ thay vì phòng.'";
      }
      
      if (lowerMessage.includes('trọ') || lowerMessage.includes('khu')) {
        systemPrompt += "\n\nWhen showing housing areas, add link: <a href='/user/housing-area/[id]' style='color: #b91c1c; font-weight: bold; text-decoration: underline;'>Xem chi tiết khu trọ</a>";
      }
      
      if (lowerMessage.includes('phòng') || lowerMessage.includes('room')) {
        systemPrompt += "\n\nWhen showing rooms, add link: <a href='/user/room/[id]' style='color: #b91c1c; font-weight: bold; text-decoration: underline;'>Xem chi tiết phòng</a>";
      }
      
      if (lowerMessage.includes('chủ') || lowerMessage.includes('landlord')) {
        systemPrompt += "\n\nWhen showing landlord info, add link: <a href='/chat/[id]' style='color: #b91c1c; font-weight: bold; text-decoration: underline;'>Liên hệ chủ trọ</a>";
      }

      // Call DeepSeek API to process the message with optimized settings
      const completion = await deepSeek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        tools: tools,
        tool_choice: "auto",
        max_tokens: 2000, // Reduce max tokens for faster response
        temperature: 0.3, // Lower temperature for more focused responses
        presence_penalty: 0.1, // Reduce repetition
        frequency_penalty: 0.1, // Reduce repetition
      });

      const assistantMessage = completion.choices[0].message;

      // Handle function calls if any
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        const messages: ChatMessage[] = [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
          {
            role: "assistant",
            content: assistantMessage.content || "",
            tool_calls: assistantMessage.tool_calls,
          },
        ];

        // Process each tool call
        for (const toolCall of assistantMessage.tool_calls) {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          let functionResult: any;

          try {
            switch (functionName) {
              case "search_housing_areas":
                functionResult = await this.searchHousingAreas(functionArgs);
                break;
              case "search_rooms":
                functionResult = await this.searchRooms(functionArgs);
                break;
              case "find_similar_rooms":
                functionResult = await this.findSimilarRooms(functionArgs);
                break;
              case "get_hola_rental_info":
                functionResult = await this.getHolaRentalInfo(functionArgs);
                break;
              case "get_rooms_by_housing_area":
                functionResult = await this.getRoomsByHousingArea(functionArgs);
                break;
              default:
                functionResult = { error: `Unknown function: ${functionName}` };
            }
          } catch (error) {
            console.error(`Error calling function ${functionName}:`, error);
            functionResult = { error: `Error calling ${functionName}` };
          }

          // Add function result to messages
          messages.push({
            role: "tool",
            content: JSON.stringify(functionResult),
            tool_call_id: toolCall.id,
          });
        }

        // Get final response from AI
        const finalCompletion = await deepSeek.chat.completions.create({
          model: "deepseek-chat",
          messages: messages,
          max_tokens: 2000,
          temperature: 0.3,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        });

        return finalCompletion.choices[0].message.content || "Sorry, I couldn't process your request.";
      }

      return assistantMessage.content || "Sorry, I couldn't process your request.";
    } catch (error) {
      console.error("Error in processMessage:", error);
      return "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.";
    }
  }

  /**
   * Search housing areas with optimized performance
   */
  private static async searchHousingAreas({ location, page = 1, pageSize = 5 }: 
    { location: string, page?: number, pageSize?: number }) {
    try {
      // Check cache first
      const cacheKey = getCacheKey('housing_areas', { location, page, pageSize });
      const cachedResult = getFromCache(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Optimize: Reduce pageSize for faster response
      const optimizedPageSize = Math.min(pageSize, 3);
      
      // Optimize: Use direct MongoDB query instead of service layer for faster response
      const HousingAreaModel = (await import("@src/models/mongoose/HousingArea")).default;
      
      // Direct MongoDB query with minimal fields for faster response
      const matchStage: any = {
        status: HousingAreaStatus.publish,
        pending_update: { $exists: false }
      };

      if (location && location.trim().length > 0) {
        matchStage.$or = [
          { name: { $regex: location, $options: "i" } },
          { "location.address": { $regex: location, $options: "i" } },
        ];
      }

      const results = await HousingAreaModel.aggregate([
        { $match: matchStage },
        { $skip: (page - 1) * optimizedPageSize },
        { $limit: optimizedPageSize },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            "location.address": 1,
            owner_id: 1,
            view_count: 1
          }
        }
      ]);

      const total = await HousingAreaModel.countDocuments(matchStage);

      // If results are found, return immediately
      if (results && results.length > 0) {
        const response = {
          success: true,
          total: total,
          query: location,
          results: results.map(area => ({
            id: area._id,
            name: area.name,
            address: area.location?.address ?? "No address available",
            description: area.description,
            owner: {
              id: area.owner_id,
              name: "Landlord", // Simplified for faster response
            },
            contact: null, // Simplified for faster response
            view_count: area.view_count ?? 0,
          })),
        };
        
        // Cache the result
        setCache(cacheKey, response);
        return response;
      }

      // FALLBACK: If no housing area found, return default housing area list
      // Direct fallback query for faster response
      const fallbackResults = await HousingAreaModel.aggregate([
        { 
          $match: {
            status: HousingAreaStatus.publish,
            pending_update: { $exists: false }
          }
        },
        { $limit: 3 },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            "location.address": 1,
            owner_id: 1,
            view_count: 1
          }
        }
      ]);

      if (fallbackResults && fallbackResults.length > 0) {
        const response = {
          success: true,
          total: fallbackResults.length,
          query: location,
          fallback: true, // Mark as fallback result
          results: fallbackResults.map(area => ({
            id: area._id,
            name: area.name,
            address: area.location?.address ?? "No address available",
            description: area.description,
            owner: {
              id: area.owner_id,
              name: "Landlord", // Simplified for faster response
            },
            contact: null, // Simplified for faster response
            view_count: area.view_count ?? 0,
          })),
        };
        
        // Cache the fallback result
        setCache(cacheKey, response);
        return response;
      }

      // If no results found at all
      return {
        success: false,
        error: "No housing area found in the system",
        query: location,
      };
    } catch (error) {
      console.error('Housing Area Search Error:', error);
      return {
        success: false,
        error: "Could not search for housing areas at this time",
        query: location,
      };
    }
  }

  /**
   * Search housing areas within a radius of 2km from lat/lng, return distance (meters)
   */
  static async searchHousingAreasByLatLng({ lat, lng, radius = 2000, page = 1,
    pageSize = 5 }: { lat: number, lng: number, radius?: number, page?: number,
       pageSize?: number, }) {
    // Optimize: Reduce pageSize for faster response
    const optimizedPageSize = Math.min(pageSize, 3);
    function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
      const R = 6371000; // Earth radius in meters
      const toRad = (x: number) => (x * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }
    try {
      const HousingAreaModel = (await import("@src/models/mongoose/HousingArea")).default;
      // MongoDB expects radius in radians: radius (m) / 6378137
      const radiusInRadians = radius / 6378137;
      const areas = await HousingAreaModel.find({
        status: 'published',
        'location.lat': { $exists: true },
        'location.lng': { $exists: true },
        location: {
          $geoWithin: {
            $centerSphere: [ [lng, lat], radiusInRadians ],
          },
        },
      })
        .skip((page - 1) * optimizedPageSize)
        .limit(optimizedPageSize);
      const results = areas.map(area => {
        const areaObj = area.toObject();
        return {
          ...areaObj,
          distance: haversineDistance(lat, lng, area.location.lat, area.location.lng),
        };
      });
      return {
        success: true,
        results,
        total: results.length,
      };
    } catch (err) {
      console.error('searchHousingAreasByLatLng error:', err);
      return { success: false, error: 'Could not find housing areas near this location.' };
    }
  }

  /**
   * Search rooms (rollback: không cache, không fallback, chỉ gọi RoomService)
   */
  private static async searchRooms(criteria: any) {
    try {
      // Gọi qua RoomService thay vì aggregate trực tiếp
      const RoomService = (await import("@src/services/RoomService")).default;
      const rooms = await RoomService.searchRooms(criteria);

      if (rooms && rooms.length > 0) {
        return {
          success: true,
          results: rooms,
        };
      }

      return {
        success: false,
        error: "No room found that meets the criteria",
        criteria: criteria,
      };
    } catch (error) {
      console.error('Room Search Error:', error);
      return {
        success: false,
        error: "Could not search for rooms at this time",
        criteria: criteria,
      };
    }
  }

  /**
   * Find similar rooms to the given room
   */
  private static async findSimilarRooms({ roomId, limit = 5 }:
    { roomId: string, limit?: number }) {
    try {
      // Check cache first
      const cacheKey = getCacheKey('similar_rooms', { roomId, limit });
      const cachedResult = getFromCache(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      const RoomModel = (await import("@src/models/mongoose/Room")).default;
      
      // Get the target room first
      const targetRoom = await RoomModel.findById(roomId);
      if (!targetRoom) {
        return {
          success: false,
          error: "Room not found",
          roomId: roomId,
        };
      }

      // Find similar rooms based on price range and type
      const similarRooms = await RoomModel.aggregate([
        {
          $match: {
            _id: { $ne: targetRoom._id },
            status: RoomStatus.available,
            housing_area_id: targetRoom.housing_area_id,
            price: {
              $gte: targetRoom.price * 0.8,
              $lte: targetRoom.price * 1.2,
            },
          },
        },
        { $limit: limit },
        {
          $lookup: {
            from: "housingareas",
            localField: "housing_area_id",
            foreignField: "_id",
            as: "housing_area",
            pipeline: [
              { $project: { name: 1, "location.address": 1, owner_id: 1 } }
            ]
          }
        },
        { $unwind: { path: "$housing_area", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            title: 1,
            price: 1,
            area: 1,
            type: 1,
            max_occupancy: 1,
            room_number: 1,
            "housing_area._id": 1,
            "housing_area.name": 1,
            "housing_area.location.address": 1,
            "housing_area.owner_id": 1,
            images: { $slice: ["$images", 1] },
            facilities: { $slice: ["$facilities", 3] }
          }
        }
      ]);

      const response = {
        success: true,
        roomId: roomId,
        targetRoom: {
          id: targetRoom._id,
          title: targetRoom.title,
          price: targetRoom.price,
          area: targetRoom.area,
          type: targetRoom.type,
        },
        similarRooms: similarRooms.map(room => ({
          id: room._id,
          title: room.title,
          price: room.price,
          area: room.area,
          type: room.type,
          max_occupancy: room.max_occupancy,
          room_number: room.room_number,
          housing_area: {
            id: room.housing_area?._id?.toString(),
            name: room.housing_area?.name ?? "Unknown",
            address: room.housing_area?.location?.address ?? "No address",
          },
          owner: {
            id: room.housing_area?.owner_id?.toString(),
            name: "Landlord",
            verified: false,
          },
          image: room.images?.[0]?.url ?? null,
          facilities: room.facilities ?? [],
        })),
      };

      // Cache the result
      setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Find Similar Rooms Error:', error);
      return {
        success: false,
        error: "Could not find similar rooms at this time",
        roomId: roomId,
      };
    }
  }

  /**
   * Get rooms by housing area ID
   */
  private static async getRoomsByHousingArea({ housingAreaId }: { housingAreaId: string }) {
    try {
      // Check cache first
      const cacheKey = getCacheKey('rooms_by_housing_area', { housingAreaId });
      const cachedResult = getFromCache(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      const RoomModel = (await import("@src/models/mongoose/Room")).default;
      
      const rooms = await RoomModel.aggregate([
        {
          $match: {
            housing_area_id: housingAreaId,
            status: RoomStatus.available,
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            price: 1,
            area: 1,
            type: 1,
            max_occupancy: 1,
            room_number: 1,
            images: { $slice: ["$images", 1] },
            facilities: { $slice: ["$facilities", 3] }
          }
        }
      ]);

      const response = {
        success: true,
        housingAreaId: housingAreaId,
        totalRooms: rooms.length,
        rooms: rooms.map(room => ({
          id: room._id,
          title: room.title,
          price: room.price,
          area: room.area,
          type: room.type,
          max_occupancy: room.max_occupancy,
          room_number: room.room_number,
          image: room.images?.[0]?.url ?? null,
          facilities: room.facilities ?? [],
        })),
      };

      // Cache the result
      setCache(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Get Rooms By Housing Area Error:', error);
      return {
        success: false,
        error: "Could not get rooms for this housing area",
        housingAreaId: housingAreaId,
      };
    }
  }
}

export default DeepSeekService; 