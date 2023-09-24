import { CogTiff } from "@cogeotiff/core";
import { SourceUrl } from "@chunkd/source-url";

const source = new SourceUrl("https://example.com/cog.tif");
const cog = await CogTiff.create(source);

const img = cog.getImage(0);
if (img.isTiled()) throw new Error("Tiff is not tiled");
const tile = await img.getTile(2, 2);
