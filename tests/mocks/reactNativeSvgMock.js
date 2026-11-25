const React = require('react');
const mockComponent = (name) => (props) => React.createElement(name, props, props ? props.children : null);
module.exports = {
  __esModule: true,
  default: mockComponent('Svg'),
  Svg: mockComponent('Svg'),
  Circle: mockComponent('Circle'),
  Defs: mockComponent('Defs'),
  Ellipse: mockComponent('Ellipse'),
  G: mockComponent('G'),
  LinearGradient: mockComponent('LinearGradient'),
  Path: mockComponent('Path'),
  Polygon: mockComponent('Polygon'),
  RadialGradient: mockComponent('RadialGradient'),
  Rect: mockComponent('Rect'),
  Stop: mockComponent('Stop'),
  Text: mockComponent('Text'),
  ClipPath: mockComponent('ClipPath'),
};
