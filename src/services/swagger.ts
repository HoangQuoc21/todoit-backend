import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Todoit API Documentation",
      description: "You can find and test all API endpoints here.",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Authentication endpoints",
      },
      {
        name: "User",
        description: "User management endpoints",
      },
      {
        name: "Category",
        description: "Category management endpoints",
      },
      {
        name: "Todo",
        description: "Todo management endpoints",
      },
      {
        name: "Notification",
        description: "Notification management endpoints",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "accessToken",
          description: "Enter your accessToken",
        },
      },
    },
  },
  apis: ["./src/features/**/*route.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
