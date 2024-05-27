export default function (url: String[]) {
  for (var i = 0; i < url.length; i++) {
    url[i] = url[i]
      .trim()
      .toLowerCase()
      .replace(/:/g, "")
      .replace(/-/g, "")
      .replace(/ /g, "_")
      .replace(/_+/g, "_"); // Replace multiple underscores with a single underscore;
  }
  return url;
}
