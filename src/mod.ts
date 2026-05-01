import { github } from '@roka/github';

const pkgList = [
  'advancely',
  'advancely-bin'
]

const curVersion = Deno.readTextFileSync(`aur/${pkgList[0]}/PKGBUILD`).split('\n')[3].split('=')[1];

async function getLatestVer() {
  const repo = github().repos.get('LNXSeus', 'Advancely');
  const releases = await repo.releases.list();

  return releases[0].tag.substring(1);
}

async function updatePackages(list: string[], version: string) {
  for (const pkg of list) {
    let PKGBUILD = Deno.readTextFileSync(`aur/${pkg}/PKGBUILD`);

    PKGBUILD = PKGBUILD.replace(curVersion, newVersion);

    Deno.writeTextFileSync(`aur/${pkg}/PKGBUILD`, PKGBUILD);

    const command = new Deno.Command('./push.sh', {
      args: [
        pkg,
        version
      ],
      stdin: "null",
      stdout: "piped"
    });

    const child = command.spawn();

    const _status = await child.status;
  }
}

const newVersion = await getLatestVer();

if (newVersion !== curVersion) {
  await updatePackages(pkgList, newVersion);
}
