
export const swaggerComponents = {
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
  schemas: {
    Location: {
      type: "object",
      properties: {
        address: { type: "string", example: "Số 1 Võ Văn Sĩ Diện" },
        district: { type: "string", example: "Thủ Đức" },
        city: { type: "string", example: "Hồ Chí Minh" },
        lat: { type: "number", format: "float", example: 21.028511 },
        lng: { type: "number", format: "float", example: 105.804817 },
      },
    },
    LegalDocument: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          example: "https://example.com/giayphep.pdf",
        },
        type: { type: "string", enum: ["image", "pdf"] },
        uploaded_at: {
          type: "string",
          format: "date-time",
          example: "2024-06-01T10:00:00.000Z",
        },
      },
    },
    HousingArea: {
      type: "object",
      properties: {
        name: { type: "string", example: "KTX Anh Ba Ko Xỉn" },
        description: {
          type: "string",
          example: "Khu nhà ở sinh viên nghèo nàn và xấu",
        },
        location: { $ref: "#/components/schemas/Location" },
        expected_rooms: { type: "integer", example: 100 },
        legal_documents: {
          type: "array",
          items: { $ref: "#/components/schemas/LegalDocument" },
        },
      },
      required: ["name", "location", "expected_rooms"],
    },
    AddHousingAreaRequest: {
      type: "object",
      properties: {
        housingArea: { $ref: "#/components/schemas/HousingArea" },
      },
      required: ["housingArea"],
    },
    ResubmitHousingAreaRequest: {
      type: "object",
      properties: {
        resubmit: {
          type: "object",
          properties: {
            name: {
              type: "string",
              example: "KTX Anh Ba Ko Xỉn (bản cập nhật)",
            },
            description: { type: "string", example: "Mô tả đã sửa" },
            location: { $ref: "#/components/schemas/Location" },
            expected_rooms: { type: "integer", example: 120 },
            legal_documents: {
              type: "array",
              items: { $ref: "#/components/schemas/LegalDocument" },
            },
          },
        },
      },
      required: ["resubmit"],
    },
    AddRoomRequest: {
      type: "object",
      properties: {
        housing_area_id: {
          type: "string",
          example: "684ae6eb7961524650c34936",
        },
        title: { type: "string", example: "Phòng cao cấp" },
        price: { type: "number", example: 666666 },
        area: { type: "number", example: 12 },
        facilities: {
          type: "array",
          items: { type: "number", example: 5 },
        },
        type: { type: "string", enum: ["SINGLE", "COUPLE"], example: "SINGLE" },
        max_occupancy: { type: "integer", example: 2 },
        room_want_create: { type: "integer", example: 10 },
      },
      required: [
        "housing_area_id",
        "title",
        "price",
        "area",
        "facilities",
        "type",
        "max_occupancy",
        "room_want_create",
      ],
    },
    UpdateRoomRequest: {
      type: "object",
      properties: {
        room_number: { type: "string", example: "R123" },
      },
    },
    Room: {
      type: "object",
      properties: {
        _id: { type: "string", example: "123456abcdef" },
        housing_area_id: {
          type: "string",
          example: "684ae6eb7961524650c34936",
        },
        title: { type: "string", example: "Phòng cao cấp" },
        price: { type: "number", example: 666666 },
        area: { type: "number", example: 12 },
        facilities: {
          type: "array",
          items: { type: "integer" },
          example: [5, 11],
        },
        type: {
          type: "string",
          enum: ["SINGLE", "COUPLE", "FAMILY"],
          example: "COUPLE",
        },
        max_occupancy: { type: "integer", example: 2 },
        created_at: { type: "string", format: "date-time" },
      },
      required: [
        "housing_area_id",
        "title",
        "price",
        "area",
        "facilities",
        "type",
        "max_occupancy",
      ],
    },
    TransactionType: {
      type: "string",
      enum: ["deposit", "service", "boosting_ads", "refund"],
    },
    DepositTransaction: {
      type: "object",
      required: ["type", "contract_id"],
      properties: {
        type: { $ref: "#/components/schemas/TransactionType" },
        contract_id: { type: "string" },
        notes: { type: "string" },
      },
    },
    ServiceTransaction: {
      type: "object",
      required: ["type", "zalo_payment"],
      properties: {
        type: { $ref: "#/components/schemas/TransactionType" },
        zalo_payment: {
          type: "object",
          required: [
            "app_id",
            "app_trans_id",
            "app_time",
            "app_user",
            "amount",
          ],
          properties: {
            app_id: { type: "integer" },
            app_trans_id: { type: "string" },
            app_time: { type: "integer" },
            app_user: { type: "string" },
            amount: { type: "number" },
          },
        },
        notes: { type: "string" },
      },
    },
    Transaction: {
      type: "object",
      properties: {
        _id: { type: "string" },
        user_id: { type: "string" },
        contract_id: { type: "string" },
        type: { $ref: "#/components/schemas/TransactionType" },
        notes: { type: "string" },
        zalo_payment: { type: "array", items: { type: "object" } },
        refunds: { type: "array", items: { type: "object" } },
        created_at: { type: "string", format: "date-time" },
      },
    },
    Contract: {
      type: "object",
      properties: {
        _id: {
          type: "string",
          example: "665f1b2d4f1e2b001c9c1234",
        },
        tenant_id: {
          type: "string",
          example: "665f1a8c4f1e2b001c9c5678",
        },
        owner_id: {
          type: "string",
          example: "665f1a7e4f1e2b001c9c2345",
        },
        room_id: {
          type: "string",
          example: "665f1b004f1e2b001c9c9999",
        },
        start_date: {
          type: "string",
          format: "date-time",
          example: "2025-06-20T00:00:00.000Z",
        },
        end_date: {
          type: "string",
          format: "date-time",
          example: "2025-12-20T00:00:00.000Z",
        },
        tenant_signature: {
          type: "boolean",
          example: true,
        },
        owner_signature: {
          type: "boolean",
          example: false,
        },
        status: {
          type: "string",
          enum: ["pending", "active", "terminated", "expired"],
          example: "pending",
        },
        created_at: {
          type: "string",
          format: "date-time",
          example: "2025-06-20T10:00:00.000Z",
        },
        updated_at: {
          type: "string",
          format: "date-time",
          example: "2025-06-20T10:00:00.000Z",
        },
      },
      required: ["tenant_id", "owner_id", "room_id", "end_date"],
    },
    CreateDisputeRequest: {
      type: "object",
      properties: {
        dispute: {
          type: "object",
          required: ["contract_id", "reason"],
          properties: {
            contract_id: {
              type: "string",
              example: "64f2364e2b894b42c66c4d51",
            },
            reason: {
              type: "string",
              example: "Người thuê bỏ phòng",
            },
            evidence: {
              type: "array",
              items: {
                type: "string",
                format: "uri",
                example: "https://example.com/evidence1.jpg",
              },
            },
          },
        },
      },
      required: ["dispute"],
    },
    Dispute: {
      type: "object",
      properties: {
        _id: { type: "string", example: "665f1b2d4f1e2b001c9c1234" },
        contract_id: { type: "string", example: "64f2364e2b894b42c66c4d51" },
        status: {
          type: "string",
          enum: ["pending", "resolved", "rejected"],
          example: "pending",
        },
        reason: { type: "string", example: "Người thuê bỏ phòng" },
        evidence: {
          type: "array",
          items: {
            type: "string",
            format: "uri",
            example: "https://example.com/evidence1.jpg",
          },
        },
        created_by: { type: "string", example: "665f1a8c4f1e2b001c9c5678" },
        created_at: {
          type: "string",
          format: "date-time",
          example: "2025-07-20T10:00:00.000Z",
        },
        updated_at: {
          type: "string",
          format: "date-time",
          example: "2025-07-20T10:00:00.000Z",
        },
      },
      required: ["contract_id", "reason", "status", "created_by"],
    },
    DisputeDetail: {
      type: "object",
      properties: {
        dispute: { $ref: "#/components/schemas/Dispute" },
        contract: { $ref: "#/components/schemas/Contract" },
      },
      required: ["dispute", "contract"],
    },
    DisputeList: {
      type: "array",
      items: { $ref: "#/components/schemas/Dispute" },
    },
    DisputeSearchList: {
      type: "object",
      properties: {
        disputes: {
          type: "array",
          items: { $ref: "#/components/schemas/Dispute" },
        },
        total: { type: "integer", example: 10 },
      },
      required: ["disputes", "total"],
    },
    User: {
      type: "object",
      properties: {
        _id: { type: "string", example: "665f1a8c4f1e2b001c9c5678" },
        email: { type: "string", example: "user@example.com" },
        full_name: { type: "string", example: "Nguyen Van A" },
        phone: { type: "string", example: "0912345678" },
        role: {
          type: "string",
          enum: ["tenant", "owner", "admin"],
          example: "tenant",
        },
        created_at: {
          type: "string",
          format: "date-time",
          example: "2025-07-20T10:00:00.000Z",
        },
        updated_at: {
          type: "string",
          format: "date-time",
          example: "2025-07-20T10:00:00.000Z",
        },
      },
      required: ["_id", "email", "full_name", "role"],
    },
    SignupResponse: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "Đăng ký thành công" },
        data: { $ref: "#/components/schemas/User" },
      },
      required: ["success", "message", "data"],
    },
    ErrorResponse: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        message: { type: "string", example: "Error message" },
        errors: {
          type: "object",
          additionalProperties: { type: "string" },
          example: { field: "Invalid value" },
        },
        code: { type: "integer", example: 400 },
      },
      required: ["success", "message"],
    },
    DisputeWithUser: {
      type: "object",
      properties: {
        _id: { type: "string", example: "665f1b2d4f1e2b001c9c1234" },
        contract_id: { type: "string", example: "64f2364e2b894b42c66c4d51" },
        status: {
          type: "string",
          enum: ["pending", "resolved", "rejected"],
          example: "pending",
        },
        reason: { type: "string", example: "Người thuê bỏ phòng" },
        evidence: {
          type: "array",
          items: {
            type: "string",
            format: "uri",
            example: "https://example.com/evidence1.jpg",
          },
        },
        created_by: { type: "string", example: "665f1a8c4f1e2b001c9c5678" },
        created_at: {
          type: "string",
          format: "date-time",
          example: "2025-07-20T10:00:00.000Z",
        },
        updated_at: {
          type: "string",
          format: "date-time",
          example: "2025-07-20T10:00:00.000Z",
        },
        disputer_info: {
          type: "object",
          properties: {
            full_name: { type: "string", example: "Nguyen Van A" },
            email: { type: "string", example: "user@example.com" },
            avatar: {
              type: "string",
              format: "uri",
              example: "https://example.com/avatar.jpg",
            },
          },
        },
      },
      required: [
        "contract_id",
        "reason",
        "status",
        "created_by",
        "disputer_info",
      ],
    },
  },

  responses: {
    UnauthorizedError: {
      description: "Không có quyền truy cập",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: {
                type: "string",
                example: "User ID not found in request",
              },
              code: { type: "integer", example: 401 },
            },
          },
        },
      },
    },
    NotFoundError: {
      description: "Không tìm thấy tài nguyên",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: { type: "string", example: "Resource not found" },
              code: { type: "integer", example: 404 },
            },
          },
        },
      },
    },
    BadRequestError: {
      description: "Yêu cầu không hợp lệ",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: { type: "string", example: "Invalid request data" },
              code: { type: "integer", example: 400 },
            },
          },
        },
      },
    },
    ForbiddenError: {
      description: "Không được phép thực hiện hành động này",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: {
                type: "string",
                example: "You have reached the post limit of 10 for this month",
              },
              code: { type: "integer", example: 403 },
            },
          },
        },
      },
    },
    PaymentRequiredError: {
      description: "Yêu cầu thanh toán để tiếp tục",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: {
                type: "string",
                example:
                  "You can only post one housing area for free. Please make a payment to continue",
              },
              code: { type: "integer", example: 402 },
            },
          },
        },
      },
    },
  },
};
