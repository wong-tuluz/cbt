import type { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger'
import { auth } from '../../modules/auth/auth'
import { APP_PORT, BETTER_AUTH_URL } from '../config'

async function fetchAuthSpec(baseURL: string): Promise<Partial<OpenAPIObject>> {
    try {
        const res = await auth.handler(new Request(`${baseURL}/api/auth/open-api/generate-schema`))
        if (!res.ok) return {}
        return res.json()
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
    const baseURL = BETTER_AUTH_URL ?? `http://localhost:${APP_PORT}`
    const authSpec = await fetchAuthSpec(baseURL)
    const doc = mergeAuthSpec(nestDoc, authSpec)

    SwaggerModule.setup('/openapi', app, doc, {
        jsonDocumentUrl: '/openapi.json',
        swaggerOptions: { docExpansion: 'none', persistAuthorization: true },
    })
}
