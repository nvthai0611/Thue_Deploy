import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import type { Express } from "express";
import { swaggerComponents } from "./swaggerComponents";

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "Hola Rental API",
    version: "1.0.0",
    description: "Tài liệu API hệ thống lý phòng trọ",
  },
  servers: [
    {
      url: "http://localhost:4000",
    },
  ],
  components: swaggerComponents,
};

export const swaggerSpec = swaggerJSDoc({
  swaggerDefinition,
  apis: ["./src/routes/*.ts"],
});

export function setupSwagger(app: Express) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  );

  app.get("/swagger.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}
