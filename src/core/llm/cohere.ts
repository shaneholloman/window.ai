import { Model, ModelConfig, RequestOptions } from "./model"

export enum CohereModelId {
  XlargeNightly = "command-xlarge-nightly",
  Xlarge = "xlarge",
  Medium = "medium"
}

// export const CohereModels = {
//   [CohereModelId.XlargeNightly]: {
//     contextLimit: 2048
//   },
//   [CohereModelId.Xlarge]: {
//     contextLimit: 2048
//   },
//   [CohereModelId.Medium]: {
//     contextLimit: 2048
//   }
// }

export function init(
  apiKey: string,
  config: Pick<ModelConfig, "quality" | "debug"> &
    Partial<Pick<ModelConfig, "cacheGet" | "cacheSet">>,
  options: RequestOptions
) {
  const modelId =
    config.quality === "low"
      ? CohereModelId.Xlarge
      : CohereModelId.XlargeNightly
  return new Model(
    {
      ...config,
      modelProvider: "cohere",
      apiKey,
      baseUrl: "https://api.cohere.ai",
      generationPath: "/generate",
      authPrefix: "BEARER ",
      modelId,
      debug: config.debug,
      customHeaders: {
        "Cohere-Version": "2022-12-06"
      },
      transformForRequest: (req) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { modelId, top_p, modelProvider, ...optsToSend } = req
        return {
          ...optsToSend,
          model: modelId,
          p: top_p
        }
      },
      transformResponse: (res) => {
        return res["generations"]
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            res["generations"][0]["text"]
          : res["text"]
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            res["text"]
          : null
      }
    },
    options
  )
}