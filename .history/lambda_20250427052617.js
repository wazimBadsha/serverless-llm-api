const { pipeline } = require("@huggingface/transformers");
const { wrap } = require("aws-lambda-helper");

let classifier;

async function loadModel() {
  try {
    classifier = await pipeline(
      "text-classification",
      "distilbert-base-uncased",
      {
        quantized: true, // Use quantized model for faster inference
      }
    );
    console.log("Model loaded successfully");
  } catch (error) {
    console.error("Model loading failed:", error);
    process.exit(1);
  }
}

// Load model during cold start
loadModel();

exports.handler = wrap(async (event, context) => {
  try {
    const { text } = event.body;

    if (!text || typeof text !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid text input" }),
      };
    }

    const result = await classifier(text);
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Inference error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Processing failed" }),
    };
  }
});
