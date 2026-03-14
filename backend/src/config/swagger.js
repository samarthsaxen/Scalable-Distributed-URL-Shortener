const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smart URL Shortener API",
      version: "1.0.0",
      description: "API documentation for URL shortening, analytics, alias checking, and redirects."
    },
    servers: [
      {
        url: process.env.BASE_URL || "http://localhost:5000",
        description: "Current API server"
      }
    ]
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(options);

swaggerSpec.paths = {
  "/api/shorten": {
    post: {
      tags: ["URL"],
      summary: "Create a short URL",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                originalUrl: { type: "string", example: "https://example.com/page" },
                customCode: { type: "string", example: "my-link" },
                expiresIn: { type: "number", example: 3600 }
              },
              required: ["originalUrl"]
            }
          }
        }
      },
      responses: {
        201: { description: "Short URL created" },
        400: { description: "Validation error" }
      }
    }
  },
  "/api/alias/{shortCode}/availability": {
    get: {
      tags: ["Alias"],
      summary: "Check custom alias availability",
      parameters: [
        {
          in: "path",
          name: "shortCode",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: { description: "Alias availability status" },
        400: { description: "Invalid alias format" }
      }
    }
  },
  "/api/stats/{shortCode}": {
    get: {
      tags: ["Analytics"],
      summary: "Get URL stats",
      parameters: [
        {
          in: "path",
          name: "shortCode",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: { description: "Stats payload returned" },
        404: { description: "URL not found" }
      }
    }
  },
  "/api/stats/{shortCode}/timeline": {
    get: {
      tags: ["Analytics"],
      summary: "Get clicks-over-time timeline",
      parameters: [
        {
          in: "path",
          name: "shortCode",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        200: { description: "Timeline data returned" },
        404: { description: "URL not found" }
      }
    }
  },
  "/api/{shortCode}": {
    get: {
      tags: ["Redirect"],
      summary: "Redirect to original URL",
      parameters: [
        {
          in: "path",
          name: "shortCode",
          required: true,
          schema: { type: "string" }
        }
      ],
      responses: {
        302: { description: "Redirect" },
        404: { description: "URL not found" },
        410: { description: "URL expired" }
      }
    }
  }
};

module.exports = swaggerSpec;
