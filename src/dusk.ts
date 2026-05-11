import { github } from '@roka/github';
import { config } from '../config.ts';

const pkgList = [
  'tp-dusk'
]

const curVersion = Deno.readTextFileSync(`aur/${pkgList[0]}/PKGBUILD`).split('\n')[3].split('=')[1];
const webhookUrl = config.webhookUrl;

async function getLatestVer() {
  const repo = github().repos.get('TwilitRealm', 'dusk');
  const releases = await repo.releases.list();

  return releases[0].tag.substring(1);
}

async function updatePackages(list: string[], version: string) {
  for (const pkg of list) {
    let PKGBUILD = Deno.readTextFileSync(`aur/${pkg}/PKGBUILD`);

    PKGBUILD = PKGBUILD.replace(curVersion, newVersion);

    Deno.writeTextFileSync(`aur/${pkg}/PKGBUILD`, PKGBUILD);

    const command = new Deno.Command('./push_dusk.sh', {
      args: [
        pkg,
        version
      ],
      stdin: "null",
      stdout: "piped"
    });

    const child = command.spawn();

    const _status = await child.status;

    await sendWebhookMessage(pkg, version);
  }
}

async function sendWebhookMessage(pkg: string, version: string) {
  const _resp = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
  },
    body: JSON.stringify({
      username: 'Roxy',
      content: `<@325254775828512778> \`${pkg}\` AUR package updated to version \`${version}\``
    })
  });
}

const newVersion = await getLatestVer();

if (newVersion !== curVersion) {
  await updatePackages(pkgList, newVersion);
}