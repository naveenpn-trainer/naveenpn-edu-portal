const Fallback = ({ message, styles }) => {
  return (
    <div
      className={`flex justify-center items-center h-screen max-h-[calc(100vh-6rem)] text-xl lg:text-2xl ${styles}`}
    >
      {message}
    </div>
  );
};

export default Fallback;
