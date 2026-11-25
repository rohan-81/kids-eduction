// Minimal expo-image stand-in for the node test environment.
function Image() {
  return null;
}
Image.prefetch = async () => true;
module.exports = { Image };
