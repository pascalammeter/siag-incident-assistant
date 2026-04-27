/**
 * /api/swagger — OpenAPI Documentation UI
 *
 * GET /api/swagger — Interactive Swagger UI (HTML page)
 *
 * Accessible in production at https://siag-incident-assistant.vercel.app/api/swagger
 * Raw OpenAPI spec available at /api/swagger/openapi.json
 */

import { NextResponse } from 'next/server';

/**
 * GET /api/swagger — Serve interactive Swagger UI HTML
 *
 * Returns an HTML page with Swagger UI loaded from CDN.
 * SIAG branding applied (red #CC0033 topbar and buttons).
 * No authentication required to view documentation.
 * API requests made from Swagger UI require X-API-Key header.
 */
export async function GET(): Promise<Response> {
  try {
    const swaggerUiHtml = generateSwaggerHTML();

    return new NextResponse(swaggerUiHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache HTML for 1 hour
      },
    });
  } catch (error) {
    console.error('[GET /api/swagger] Error generating Swagger UI:', error);
    return NextResponse.json(
      { error: 'Failed to generate Swagger UI' },
      { status: 500 }
    );
  }
}

/**
 * Generate Swagger UI HTML with CDN assets and SIAG branding.
 *
 * Uses swagger-ui-dist@4 from unpkg CDN to avoid bundling.
 * Spec is loaded at runtime from /api/swagger/openapi.json.
 */
function generateSwaggerHTML(): string {
  const specUrl = '/api/swagger/openapi.json';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta
    name="description"
    content="SIAG Incident Management API Documentation"
  />
  <title>SIAG Incident API Docs</title>

  <!-- Swagger UI CSS from CDN -->
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *,
    *:before,
    *:after {
      box-sizing: inherit;
    }
    body {
      margin: 0;
      padding: 0;
    }

    /* SIAG branding */
    .swagger-ui .topbar {
      background-color: #CC0033;
    }
    .swagger-ui .information .title {
      color: #CC0033;
      font-weight: 700;
    }
    .swagger-ui .btn-authorize {
      background-color: #CC0033;
      border-color: #CC0033;
    }
    .swagger-ui .btn-authorize:hover {
      background-color: #990026;
      border-color: #990026;
    }
    .swagger-ui .model-box {
      background: rgba(204, 0, 51, 0.05);
      border: 1px solid #CC0033;
    }
    .swagger-ui .scheme-container {
      background: #fafafa;
      margin: 0 0 20px;
      padding: 30px;
      border-radius: 4px;
      border: 2px solid #CC0033;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>

  <!-- Swagger UI bundle from CDN -->
  <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js" crossorigin></script>
  <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-standalone-preset.js" crossorigin></script>

  <script>
    window.onload = () => {
      const ui = SwaggerUIBundle({
        url: '${specUrl}',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        defaultModelsExpandDepth: 1,
        docExpansion: "list",
        displayOperationId: true,
        persistAuthorization: true,
        filter: true,
        showExtensions: false,
        supportedSubmitMethods: [
          'get', 'post', 'put', 'delete', 'patch', 'options', 'trace'
        ]
      });
      window.ui = ui;
    };
  </script>
</body>
</html>`;
}
