# Green Chef Local Node App

## How to Deploy with Docker

1. Build the Docker image:
   ```
   docker build -t greenchef-status .
   ```

2. Run the container:
   ```
   docker run -p 3000:3000 --name greenchef-status greenchef-status
   ```

## How to Deploy with Portainer

- Open Portainer and go to the "Images" section.
- Pull your image (or upload a local build).
- Go to "Containers" and create a new container:
  - Use the image name `greenchef-status`.
  - Set "Publish a new network port" to map container port 3000 to a host port (e.g., 3000).
  - Deploy the container.
- Access the app at:
  ```
  http://YOUR_HOST_IP:3000
  ```