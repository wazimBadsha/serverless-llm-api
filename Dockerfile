FROM public.ecr.aws/lambda/nodejs:18

# Install system dependencies for Transformers.js
RUN yum install -y python3 make gcc-c++

WORKDIR /usr/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --production

# Pre-download the model during build (reduces cold-start time)
RUN npx transformers-cli download distilbert-base-uncased --format onnx --quiet

COPY . .

CMD ["lambda.handler"]