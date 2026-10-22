export function createTripStopMarker(index: number, label: string) {
  const element = document.createElement("div");
  element.className = "trip-route-marker";
  const number = document.createElement("span");
  number.textContent = String(index + 1);
  const name = document.createElement("strong");
  // Stop names can come from AI, providers or saved input; never parse as HTML.
  name.textContent = label;
  element.append(number, name);
  return element;
}
