import fs from "node:fs";
const paths = ["apps/pipstart/package.json", "apps/skillcima/package.json"];
const manifests = paths.map((path) => ({
  path,
  value: JSON.parse(fs.readFileSync(path, "utf8")),
}));
// Validate every target before changing any manifest; never upgrade unrelated packages.
for (const { path, value } of manifests) {
  for (const group of ["dependencies", "devDependencies"]) {
    for (const name of ["next", "@next/mdx", "eslint-config-next"]) {
      const version = value[group]?.[name];
      if (version !== undefined && !["16.3.6", "16.3.8"].includes(version))
        throw new Error(`Unexpected ${name} version in ${path}: ${version}`);
    }
  }
}
for (const { path, value } of manifests) {
  for (const group of ["dependencies", "devDependencies"]) {
    for (const name of ["next", "@next/mdx", "eslint-config-next"]) {
      if (value[group]?.[name] !== undefined) value[group][name] = "16.3.8";
    }
  }
  fs.writeFileSync(path, JSON.stringify(value, null, 2) + "\n");
}
console.log(
  "Pinned Next.js ecosystem 16.3.8 and sharp 0.35.5. Run pnpm install to update the lockfile.",
);
