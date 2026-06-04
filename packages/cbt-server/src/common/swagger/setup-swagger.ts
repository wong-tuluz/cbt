import type { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger'
import { auth } from '../../modules/auth/auth'

async function getAuthSpec(): Promise<Partial<OpenAPIObject>> {
    try {
        return await auth.api.generateOpenAPISchema() as Partial<OpenAPIObject>
    } catch {
        return {}
    }
}

function mergeAuthSpec(nestDoc: OpenAPIObject, authSpec: Partial<OpenAPIObject>): OpenAPIObject {
    if (!authSpec.paths) return nestDoc

    const authPaths: OpenAPIObject['paths'] = {}
    for (const [path, item] of Object.entries(authSpec.paths)) {
        authPaths[`/api/auth${path}`] = item
    }

    return {
        ...nestDoc,
        paths: { ...nestDoc.paths, ...authPaths },
        components: {
            ...nestDoc.components,
            schemas: { ...nestDoc.components?.schemas, ...authSpec.components?.schemas },
            securitySchemes: { ...nestDoc.components?.securitySchemes, ...authSpec.components?.securitySchemes },
        },
        tags: [...(nestDoc.tags ?? []), ...(authSpec.tags ?? [])],
    }
}

export async function setupSwagger(app: INestApplication): Promise<void> {
    const config = new DocumentBuilder()
        .setTitle('Nexust LMS CBT')
        .setDescription('Nexus LMS CBT')
        .setVersion('0.1.0')
        .addBearerAuth()
        .build()

    const nestDoc = SwaggerModule.createDocument(app, config)
    const authSpec = await getAuthSpec()
    const doc = mergeAuthSpec(nestDoc, authSpec)

    SwaggerModule.setup('/openapi', app, doc, {
        jsonDocumentUrl: '/openapi.json',
        swaggerOptions: { docExpansion: 'none', persistAuthorization: true },
    })
}
