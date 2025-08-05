import { useTimeFrameStore } from "../stores/timeFrameStore";

const TimeFrameSwitcher = () => {
  const { timeFrame, setTimeFrame } = useTimeFrameStore();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimeFrame = e.target.value as TimeInterval;
    setTimeFrame(newTimeFrame);
    setRange(newTimeFrame);
  };

  return (
    <select value={timeFrame} onChange={handleChange}>
      <option value="1m">1 Minute</option>
      <option value="5m">5 Minutes</option>
      <option value="15m">15 Minutes</option>
      <option value="1h">1 Hour</option>
      <option value="1d">1 Day</option>
    </select>
  );
};

export { TimeFrameSwitcher };
