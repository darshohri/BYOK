import './StarBorder.css';

const StarBorder = ({
  as: Component = 'button',
  className = '',
  color = 'white',
  speed = '6s',
  thickness = 1,
  children,
  ...rest
}) => {
  // Parse speed string to a number in seconds for the stagger delay
  const speedNum = parseFloat(speed) || 6;
  const halfSpeed = `${speedNum / 2}s`;

  return (
    <Component
      className={`star-border-container ${className}`}
      style={{
        '--star-color': color,
        padding: `${thickness}px 0`,
        ...rest.style
      }}
      {...rest}
    >
      {/* Primary bottom dot */}
      <div
        className="border-gradient-bottom"
        style={{ animationDuration: speed }}
      ></div>
      {/* Staggered bottom dot — starts halfway through, so one is always visible */}
      <div
        className="border-gradient-bottom"
        style={{ animationDuration: speed, animationDelay: halfSpeed }}
      ></div>

      {/* Primary top dot */}
      <div
        className="border-gradient-top"
        style={{ animationDuration: speed }}
      ></div>
      {/* Staggered top dot */}
      <div
        className="border-gradient-top"
        style={{ animationDuration: speed, animationDelay: halfSpeed }}
      ></div>

      <div className="inner-content">{children}</div>
    </Component>
  );
};

export default StarBorder;
