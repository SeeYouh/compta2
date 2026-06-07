const SaveStatus = ({ status }) => {
  if (!status) return null;
  return (
    <div className={`paper-product__status paper-product__status--${status.type}`}>
      {status.message}
    </div>
  );
};

export default SaveStatus;
