import './StarBorder.css';

const StarBorder = ({
  as: Component = 'div',
  className = '',
  color = 'cyan',
  speed = '5s',
  thickness = 2,
  children,
  ...rest
}) => {
  return (
    <Component
      className={`star-border-container ${className}`}
      style={{
        padding: `${thickness}px`, /* Padding on all 4 sides perfectly exposes the 4 moving lines */
        ...rest.style
      }}
      {...rest}
    >
      <div
        className="border-gradient-top"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          animationDuration: speed,
          height: `${thickness}px` /* Strictly locked to the padding height */
        }}
      ></div>
      <div
        className="border-gradient-bottom"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          animationDuration: speed,
          height: `${thickness}px` /* Strictly locked to the padding height */
        }}
      ></div>
      <div
        className="border-gradient-left"
        style={{
          background: `linear-gradient(180deg, transparent, ${color}, transparent)`,
          animationDuration: speed,
          width: `${thickness}px` /* Strictly locked to the padding width */
        }}
      ></div>
      <div
        className="border-gradient-right"
        style={{
          background: `linear-gradient(180deg, transparent, ${color}, transparent)`,
          animationDuration: speed,
          width: `${thickness}px` /* Strictly locked to the padding width */
        }}
      ></div>
      <div className="inner-content">{children}</div>
    </Component>
  );
};

export default StarBorder;
