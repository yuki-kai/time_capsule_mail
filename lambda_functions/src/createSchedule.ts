export const handler = async () => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
  
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Methods": "GET,OPTIONS,POST"
    },
    body: JSON.stringify({ message: 'Hello from createSchedule' })
  }
};
