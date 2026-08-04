/**
 * Enveloppe un handler Express asynchrone pour transmettre tout rejet de promesse
 * à `next()`, et donc au middleware `errorHandler` centralisé.
 *
 * Express 4 ne capte pas les rejets d'un handler déclaré `async` : sans cette
 * enveloppe, une erreur asynchrone non gérée (timeout MongoDB, CastError sur un
 * id malformé, échec d'envoi d'email…) laisse la requête pendante — le client
 * n'obtient jamais de réponse et `errorHandler` n'est jamais atteint.
 *
 * @param {Function} fn Handler Express asynchrone `(req, res, next)`
 * @returns {Function} Handler Express équivalent, dont les rejets vont à `next()`
 */
export const asyncHandler = (fn) => (req, res, next) => {
  // Le try/catch couvre les levées SYNCHRONES : `Promise.resolve(fn(...))` évalue
  // `fn(...)` avant d'envelopper, donc un throw synchrone échapperait au `.catch`.
  // Sans lui, un handler non-`async` laisserait l'erreur remonter hors d'Express.
  try {
    return Promise.resolve(fn(req, res, next)).catch(next);
  } catch (error) {
    next(error);
    return undefined;
  }
};
