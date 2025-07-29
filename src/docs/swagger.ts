import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        version: "v0.0.1",
        title: "Dokumentasi API ACARA",
        description: "API ACARA untuk app Acara"
    },
    servers: [
        {
            url: "http://localhost:3000/api",
            description: "Local Server",
        },
        {
            url: "https://back-end-acara-vert-zeta.vercel.app/api",
            description: "Deployment Server",
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
            },
        },
        schemas: {
            LoginRequest: {
                identifier: "cytusnew",
                password: "12341234",
            }
        }
    },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.ts"];

swaggerAutogen({openapi: "3.0.0"})(outputFile, endpointsFiles, doc);