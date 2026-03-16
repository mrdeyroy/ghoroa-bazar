export default function Skeleton({ className, width, height, circle }) {
  const style = {
    width: width || "100%",
    height: height || "20px",
    borderRadius: circle ? "50%" : "8px",
  };

  return (
    <div
      className={`bg-gray-200 animate-pulse ${className}`}
      style={style}
    />
  );
}
