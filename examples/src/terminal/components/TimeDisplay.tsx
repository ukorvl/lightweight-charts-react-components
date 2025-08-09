const TimeDisplay = () => {
  return (
    <div style={{ padding: "8px", fontSize: "14px", color: "#fff" }}>
      {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      {`UTC ${new Date().getTimezoneOffset() / -60}`}
    </div>
  );
};

export { TimeDisplay };
