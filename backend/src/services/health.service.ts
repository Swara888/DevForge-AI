export const getHealthStatus = () => {
  return {
    status: "ok",
    service: "devforge-ai-backend",
    timestamp: new Date().toISOString(),
  };
};