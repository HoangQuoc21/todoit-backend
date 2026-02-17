import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Todoit API Documentation",
      description: "You can find and test all API endpoints here.",
      version: "1.0.0",
    },
  },
  apis: ["./src/features/**/*route.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
