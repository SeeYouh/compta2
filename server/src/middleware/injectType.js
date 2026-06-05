/**
 * Middleware qui injecte req.categoryType selon la route montée.
 * Le type n'est JAMAIS fourni par le client.
 *
 * Usage : router.use('/catalog', injectType('catalog'), categoryRoutes)
 */
export const injectType = (type) => (req, res, next) => {
  req.categoryType = type;
  next();
};
