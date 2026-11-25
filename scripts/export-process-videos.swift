import AVFoundation
import AppKit

// Системний macOS-експорт: H.264 переноситься в MP4 без повторного стискання.
// Оригінали, тривалість, звук і вбудовані написи лишаються незмінними.
let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let input = root.appendingPathComponent("assets-originals/videos")
let output = root.appendingPathComponent("public/videos/process")
let posters = root.appendingPathComponent("assets-originals/videos/generated")
for folder in [output, posters] {
  try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
}
let selectedFrames = [2, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 2, 1, 0, 2, 2]
var records: [[String: Any]] = []
var index = 0
for url in try FileManager.default.contentsOfDirectory(at: input, includingPropertiesForKeys: nil).sorted(by: { $0.lastPathComponent < $1.lastPathComponent }) where url.pathExtension.lowercased() == "mov" {
  let asset = AVURLAsset(url: url)
  let name = url.deletingPathExtension().lastPathComponent.lowercased()
  let destination = output.appendingPathComponent(name + "-v1.mp4")
  if !FileManager.default.fileExists(atPath: destination.path) {
    guard let exporter = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetPassthrough) else { fatalError("Export unavailable: \(name)") }
    exporter.outputURL = destination
    exporter.outputFileType = .mp4
    exporter.shouldOptimizeForNetworkUse = true
    let completion = DispatchSemaphore(value: 0)
    exporter.exportAsynchronously { completion.signal() }
    completion.wait()
    guard exporter.status == .completed else { fatalError("Export failed: \(String(describing: exporter.error))") }
  }
  let frameTime = asset.duration.seconds * [0.15, 0.35, 0.55, 0.75][selectedFrames[index]]
  index += 1
  let generator = AVAssetImageGenerator(asset: asset)
  generator.appliesPreferredTrackTransform = true
  let cg = try generator.copyCGImage(at: CMTime(seconds: frameTime, preferredTimescale: 600), actualTime: nil)
  let rep = NSBitmapImageRep(cgImage: cg)
  try rep.representation(using: .jpeg, properties: [.compressionFactor: 0.98])!.write(to: posters.appendingPathComponent(name + ".jpg"))
  let exported = AVURLAsset(url: destination)
  let track = exported.tracks(withMediaType: .video).first!
  let size = track.naturalSize.applying(track.preferredTransform)
  records.append([
    "id": name,
    "source": "assets-originals/videos/" + url.lastPathComponent,
    "src": "videos/process/" + name + "-v1.mp4",
    "posterTime": frameTime,
    "duration": asset.duration.seconds,
    "exportDuration": exported.duration.seconds,
    "width": Int(abs(size.width)), "height": Int(abs(size.height)),
    "bytes": try destination.resourceValues(forKeys: [.fileSizeKey]).fileSize!,
    "originalBytes": try url.resourceValues(forKeys: [.fileSizeKey]).fileSize!
  ])
  print("Exported \(name)")
  fflush(stdout)
}
try JSONSerialization.data(withJSONObject: records, options: [.prettyPrinted, .sortedKeys]).write(to: root.appendingPathComponent("assets-originals/videos/manifest.json"))
