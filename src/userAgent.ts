import { flow } from "fp-ts/lib/function";
import { randomElem, randomInt } from "fp-ts/lib/Random";
import { ReadonlyNonEmptyArray } from "fp-ts/lib/ReadonlyNonEmptyArray";

type Browser = "chrome" | "iexplorer" | "firefox" | "safari" | "opera";

type OS = "lin" | "mac" | "win";

const procs: Record<OS, ReadonlyNonEmptyArray<string>> = {
  lin: ["i686", "x86_64"],
  mac: ["Intel", "PPC", "U; Intel", "U; PPC"],
  win: ["", "WOW64", "Win64; x64"],
};

const rndBetween = (min: number, max: number) => randomInt(min, max)();

const randomLang = randomElem([
  "AB",
  "AF",
  "AN",
  "AR",
  "AS",
  "AZ",
  "BE",
  "BG",
  "BN",
  "BO",
  "BR",
  "BS",
  "CA",
  "CE",
  "CO",
  "CS",
  "CU",
  "CY",
  "DA",
  "DE",
  "EL",
  "EN",
  "EO",
  "ES",
  "ET",
  "EU",
  "FA",
  "FI",
  "FJ",
  "FO",
  "FR",
  "FY",
  "GA",
  "GD",
  "GL",
  "GV",
  "HE",
  "HI",
  "HR",
  "HT",
  "HU",
  "HY",
  "ID",
  "IS",
  "IT",
  "JA",
  "JV",
  "KA",
  "KG",
  "KO",
  "KU",
  "KW",
  "KY",
  "LA",
  "LB",
  "LI",
  "LN",
  "LT",
  "LV",
  "MG",
  "MK",
  "MN",
  "MO",
  "MS",
  "MT",
  "MY",
  "NB",
  "NE",
  "NL",
  "NN",
  "NO",
  "OC",
  "PL",
  "PT",
  "RM",
  "RO",
  "RU",
  "SC",
  "SE",
  "SK",
  "SL",
  "SO",
  "SQ",
  "SR",
  "SV",
  "SW",
  "TK",
  "TR",
  "TY",
  "UK",
  "UR",
  "UZ",
  "VI",
  "VO",
  "YI",
  "ZH",
]);

const randomOS = randomElem<OS>(["mac", "win", "lin"]);
const randomBrowser = randomElem<Browser>([
  "chrome",
  "iexplorer",
  "firefox",
  "safari",
  "opera",
]);

const randomProc = (arch: OS) => randomElem(procs[arch])();

const randomRevision = () => {
  let return_val = "";
  for (let x = 0; x < 2; x++) {
    return_val += "." + rndBetween(0, 9);
  }
  return return_val;
};

const versionString = {
  net: function () {
    return [
      rndBetween(1, 4),
      rndBetween(0, 9),
      rndBetween(10000, 99999),
      rndBetween(0, 9),
    ].join(".");
  },
  nt: () => rndBetween(5, 6) + "." + rndBetween(0, 3),
  ie: () => rndBetween(7, 11),
  trident: () => rndBetween(3, 7) + "." + rndBetween(0, 1),
  osx: (delim?: string) =>
    [10, rndBetween(5, 10), rndBetween(0, 9)].join(delim || "."),
  chrome: () => [rndBetween(13, 39), 0, rndBetween(800, 899), 0].join("."),
  presto: () => "2.9." + rndBetween(160, 190),
  presto2: () => rndBetween(10, 12) + ".00",
  safari: () =>
    rndBetween(531, 538) + "." + rndBetween(0, 2) + "." + rndBetween(0, 2),
};

const browser = {
  firefox: function firefox(arch: OS) {
    //https://developer.mozilla.org/en-US/docs/Gecko_user_agent_string_reference
    const firefox_ver = rndBetween(5, 15) + randomRevision(),
      gecko_ver = "Gecko/20100101 Firefox/" + firefox_ver,
      proc = randomProc(arch),
      os_ver =
        arch === "win"
          ? "(Windows NT " + versionString.nt() + (proc ? "; " + proc : "")
          : arch === "mac"
          ? "(Macintosh; " + proc + " Mac OS X " + versionString.osx()
          : "(X11; Linux " + proc;

    return (
      "Mozilla/5.0 " +
      os_ver +
      "; rv:" +
      firefox_ver.slice(0, -2) +
      ") " +
      gecko_ver
    );
  },

  iexplorer: () => {
    const ver = versionString.ie();

    if (ver >= 11) {
      //http://msdn.microsoft.com/en-us/library/ie/hh869301(v=vs.85).aspx
      return (
        "Mozilla/5.0 (Windows NT 6." +
        rndBetween(1, 3) +
        "; Trident/7.0; " +
        randomElem(["Touch; ", ""])() +
        "rv:11.0) like Gecko"
      );
    }

    //http://msdn.microsoft.com/en-us/library/ie/ms537503(v=vs.85).aspx
    return (
      "Mozilla/5.0 (compatible; MSIE " +
      ver +
      ".0; Windows NT " +
      versionString.nt() +
      "; Trident/" +
      versionString.trident() +
      (rndBetween(0, 1) === 1 ? "; .NET CLR " + versionString.net() : "") +
      ")"
    );
  },

  opera: (arch: OS) => {
    //http://www.opera.com/docs/history/
    const presto_ver =
        " Presto/" +
        versionString.presto() +
        " Version/" +
        versionString.presto2() +
        ")",
      os_ver =
        arch === "win"
          ? "(Windows NT " +
            versionString.nt() +
            "; U; " +
            randomLang() +
            presto_ver
          : arch === "lin"
          ? "(X11; Linux " +
            randomProc(arch) +
            "; U; " +
            randomLang() +
            presto_ver
          : "(Macintosh; Intel Mac OS X " +
            versionString.osx() +
            " U; " +
            randomLang() +
            " Presto/" +
            versionString.presto() +
            " Version/" +
            versionString.presto2() +
            ")";

    return (
      "Opera/" + rndBetween(9, 14) + "." + rndBetween(0, 99) + " " + os_ver
    );
  },

  safari: (arch: OS) => {
    const safari = versionString.safari(),
      ver = rndBetween(4, 7) + "." + rndBetween(0, 1) + "." + rndBetween(0, 10),
      os_ver =
        arch === "mac"
          ? "(Macintosh; " +
            randomProc("mac") +
            " Mac OS X " +
            versionString.osx("_") +
            " rv:" +
            rndBetween(2, 6) +
            ".0; " +
            randomLang() +
            ") "
          : "(Windows; U; Windows NT " + versionString.nt() + ")";

    return (
      "Mozilla/5.0 " +
      os_ver +
      "AppleWebKit/" +
      safari +
      " (KHTML, like Gecko) Version/" +
      ver +
      " Safari/" +
      safari
    );
  },

  chrome: (arch: OS) => {
    const chrome = versionString.chrome(),
      os_ver =
        arch === "mac"
          ? "(Macintosh; " +
            randomProc("mac") +
            " Mac OS X " +
            versionString.osx("_") +
            ") "
          : arch === "win"
          ? "(Windows; U; Windows NT " + versionString.nt() + ")"
          : "(X11; Linux " + randomProc(arch);

    return (
      "Mozilla/5.0 " +
      os_ver +
      " AppleWebKit/" +
      chrome +
      " (KHTML, like Gecko) Chrome/" +
      versionString.chrome() +
      " Safari/" +
      chrome
    );
  },
};

export const generateUserAgent = flow(randomOS, browser[randomBrowser()]);
