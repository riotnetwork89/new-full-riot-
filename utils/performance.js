export const logDatabaseQuery = (queryName, startTime) => {
  const duration = Date.now() - startTime;
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DB Query] ${queryName}: ${duration}ms`);
  }
};

export const withQueryLogging = async (queryName, queryFn) => {
  const startTime = Date.now();
  try {
    const result = await queryFn();
    logDatabaseQuery(queryName, startTime);
    return result;
  } catch (error) {
    logDatabaseQuery(`${queryName} (ERROR)`, startTime);
    throw error;
  }
};
