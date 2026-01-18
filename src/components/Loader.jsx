const Loading = ({ message }) => {
  return (
    <div className="flex items-center justify-center gap-x-4 h-screen">
      <div className="w-7 h-7 lg:w-10 lg:h-10 border-4 border-primary border-solid rounded-full animate-spin  border-t-transparent" />
      <p className="text-lg text-primary">{message || "Loading"}</p>
    </div>
  );
};

export default Loading;
