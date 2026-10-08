// Which recovered files make up Ani and the Director she runs on.
// Paths are relative to the project root. Versions are the latest on tape
// 7005017 (backed up around 5 February 1979) unless noted.

// Ani's files, in the order KEN;LOAD 33 reads their tags (READ-ANI-TAGS).
// METHOD, also in that list, did not survive and is not in the 1979 tags table.
export const ANI_FILES = [
  "sugrel.54", "sugest.123", "emote.9", "dscrp.17", "relate.22", "csumry.12", "film.17",
  "scene.9", "elemnt.1", "char.2", "cindy.46", "cosug.215", "compar.69", "sumcom.53",
  "glosug.41", "choose.198", "cpoint.87", "chocho.19", "nodes.38", "postpo.28", "chomet.123",
  "convey.64", "sugcon.26", "disply.311", "prereq.19", "action.152", "animov.21",
  "interf.149", "dichar.103", "disact.7", "place.45",
].map((f) => `original/7005017/${f}`);

// Ani's driver files: pass 1 (DATEST), pass 2 (RUN), running her films in Director (ANINIT).
export const DRIVER_FILES = ["datest.56", "run.65", "aninit.65"].map((f) => `original/7005017/${f}`);

// Director files that survived in KEN; plus KEN1;DRECT, recovered from an Emacs save file.
export const DIRECTOR_FILES = [
  "}^rsv.6", // KEN1;DRECT
  "some.666", "object.401", "screen.86", "movie.153", "poly.29", "actcom.17",
  "lisp.7", "load.33", "declar.67", "decla2.186", "dump.44", "tv2r.8", "diagrm.92",
].map((f) => `original/7005017/${f}`);

// Director compiled into plain MacLisp: evidence for what the lost macros generated.
export const EXPANDED_FILES = ["some.lisp", "object.lisp", "movie.lisp", "poly.lisp", "screen.lisp"].map(
  (f) => `original/7005017/${f}`,
);

// Earlier and later versions that can stand in for, or explain, lost KEN1 files.
export const OTHER_VERSIONS = [
  "original/3100153/direct.134", "original/3100153/direct.133", "original/3100153/dl.140",
  "original/3100153/inter.171", "original/3100153/turt.427", "original/3100153/fwnew.53",
  "original/3100153/loops.109", "original/3100153/actors.6", "original/3100153/movie.1",
  "original/3100153/circs.108", "original/3100153/color.19", "original/3100153/cs.15",
  "original/3100153/lmouse.5", "original/3100153/qq.64", "original/3100153/option.3",
  "original/7005044/anima.82", "original/7005044/turt.20", "original/7005044/fw.91",
  "original/9004336/some.1005", "original/9004336/perfor.685", "original/9004336/movie.214",
  "original/9004336/poly.53", "original/9004336/lispm.35", "original/9004336/load.63",
  "original/9004336/decla2.249", "original/9004336/box.78",
];

// Outputs of the 1979 runs.
export const ORACLE_FILES = {
  pass1: "original/7005017/cp.29", // 102 choice points: 54 relative + 48 absolute
  pass1WithSuggestions: "original/9004336/run24.2",
};
