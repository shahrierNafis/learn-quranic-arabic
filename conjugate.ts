/* ================================
   ENUMS & TYPES
================================ */

export enum Tense {
  Perfect = "perf",
  Present = "pres",
}

export enum Person {
  First = "1st",
  Second = "2nd",
  Third = "3rd",
}

export enum NumberType {
  Singular = "sing",
  Dual = "dual",
  Plural = "plu",
}

export enum Gender {
  Masculine = "masc",
  Feminine = "fem",
}

export enum Mood {
  Indicative = "ind",
  Subjunctive = "subj",
  Jussive = "juss",
}

export enum Voice {
  Active = "active",
  Passive = "passive",
}

export type FormNumber = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";

type PerfectAffix = [string, string];
type PresentAffix = [string, string, string];

/* ================================
   VERB HASH TABLE
================================ */

class VerbHashTable {
  private table: Record<number, PerfectAffix | PresentAffix> = {};

  private verify(tense: Tense, person: Person, num: NumberType, gender: Gender) {
    if (!Object.values(Tense).includes(tense)) throw new Error("Invalid tense");
    if (!Object.values(Person).includes(person)) throw new Error("Invalid person");
    if (!Object.values(NumberType).includes(num)) throw new Error("Invalid number");
    if (!Object.values(Gender).includes(gender)) throw new Error("Invalid gender");
  }

  private hash(tense: Tense, person: Person, num: NumberType, gender: Gender): number {
    this.verify(tense, person, num, gender);

    const personPrime = parseInt(person[0]);
    const tensePrime = tense === Tense.Perfect ? 5 : 7;
    const genderPrime = gender === Gender.Masculine ? 11 : 13;
    const numPrime = num === NumberType.Singular ? 17 : num === NumberType.Plural ? 19 : 23;

    return personPrime * tensePrime * genderPrime * numPrime;
  }

  add(tense: Tense, person: Person, num: NumberType, gender: Gender, value: any) {
    this.table[this.hash(tense, person, num, gender)] = value;
  }

  get(tense: Tense, person: Person, num: NumberType, gender: Gender) {
    return this.table[this.hash(tense, person, num, gender)];
  }
}

/* ================================
   CONJUGATOR
================================ */

export class Conjugate {
  private verbTable = new VerbHashTable();

  constructor() {
    this.buildAffixes();
  }

  /* ========= Forms 1–10 ========= */

  private form1(rad1: string, rad2: string, rad3: string, stem: string, tense: Tense, voice: Voice): string {
    let initialVowel: string = "";
    let stemVowel: string = "";

    if (tense === Tense.Perfect) {
      initialVowel = voice === Voice.Active ? "a" : "u";
      stemVowel = voice === Voice.Active ? stem : "i";
    }

    if (tense === Tense.Present) {
      initialVowel = "";
      stemVowel = voice === Voice.Active ? stem : "a";
    }

    const form_one = rad1 + initialVowel + rad2 + stemVowel + rad3;
    return form_one;
  }

  private form2(r1: string, r2: string, r3: string, tense: Tense, voice: Voice) {
    const initial = tense === Tense.Perfect ? (voice === Voice.Active ? "a" : "u") : "a";

    const stemVowel =
      tense === Tense.Perfect ? (voice === Voice.Active ? "a" : "i") : voice === Voice.Active ? "i" : "a";

    return r1 + initial + r2 + r2 + stemVowel + r3;
  }

  private form3(rad1: string, rad2: string, rad3: string, tense: Tense, voice: Voice): string {
    let initialVowel: string = "";
    let stemVowel: string = "";

    if (tense === Tense.Perfect) {
      initialVowel = voice === Voice.Active ? "a" : "u";
      stemVowel = voice === Voice.Active ? "a" : "i";
    }

    if (tense === Tense.Present) {
      initialVowel = "a";
      stemVowel = voice === Voice.Active ? "i" : "a";
    }

    const form3 = rad1 + initialVowel.repeat(2) + rad2 + stemVowel + rad3;
    return form3;
  }

  private form4(r1: string, r2: string, r3: string, tense: Tense, voice: Voice) {
    const initial = tense === Tense.Perfect ? (voice === Voice.Active ? "a" : "u") : "";

    const stemVowel =
      tense === Tense.Perfect ? (voice === Voice.Active ? "a" : "i") : voice === Voice.Active ? "i" : "a";

    return initial + r1 + r2 + stemVowel + r3;
  }

  private form5(r1: string, r2: string, r3: string, tense: Tense, voice: Voice) {
    const prefix = voice === Voice.Active || tense === Tense.Present ? "ta" : "tu";

    const stemVowel = tense === Tense.Perfect ? (voice === Voice.Active ? "a" : "i") : "a";

    return prefix + r1 + "a" + r2 + r2 + stemVowel + r3;
  }

  private form6(r1: string, r2: string, r3: string, tense: Tense, voice: Voice) {
    const prefix = "t" + (voice === Voice.Active || tense === Tense.Present ? "a" : "u");
    return prefix + r1 + "aa" + r2 + "a" + r3;
  }

  private form7(r1: string, r2: string, r3: string, tense: Tense, voice: Voice) {
    const prefix = tense === Tense.Present ? "n" : voice === Voice.Active ? "in" : "un";

    return prefix + r1 + "a" + r2 + "a" + r3;
  }

  private form8(r1: string, r2: string, r3: string, tense: Tense, voice: Voice) {
    const prefix = tense === Tense.Present ? "" : voice === Voice.Active ? "i" : "u";

    return prefix + r1 + "t" + "a" + r2 + "a" + r3;
  }

  private form9(r1: string, r2: string, r3: string) {
    return r1 + "a" + r2 + r2 + "a" + r3;
  }

  private form10(r1: string, r2: string, r3: string, tense: Tense, voice: Voice) {
    const prefix = tense === Tense.Present ? "st" : voice === Voice.Active ? "ist" : "ust";

    return prefix + "a" + r1 + r2 + "a" + r3;
  }

  /* ========= Mood ========= */

  private moodMarker(mood: Mood, indMarker: string) {
    if (mood === Mood.Indicative) return indMarker;
    if (mood === Mood.Subjunctive) return indMarker === "u" ? "a" : "";
    return "";
  }

  /* ========= Affixes ========= */

  private buildAffixes() {
    // PERFECT
    this.verbTable.add(Tense.Perfect, Person.First, NumberType.Singular, Gender.Masculine, ["", "tu"]);
    this.verbTable.add(Tense.Perfect, Person.Second, NumberType.Singular, Gender.Masculine, ["", "ta"]);
    this.verbTable.add(Tense.Perfect, Person.Second, NumberType.Singular, Gender.Feminine, ["", "ti"]);
    this.verbTable.add(Tense.Perfect, Person.Third, NumberType.Singular, Gender.Masculine, ["", "a"]);
    this.verbTable.add(Tense.Perfect, Person.Third, NumberType.Singular, Gender.Feminine, ["", "at"]);

    this.verbTable.add(Tense.Perfect, Person.Second, NumberType.Dual, Gender.Masculine, ["", "tumaa"]);
    this.verbTable.add(Tense.Perfect, Person.Third, NumberType.Dual, Gender.Masculine, ["", "aa"]);
    this.verbTable.add(Tense.Perfect, Person.Third, NumberType.Dual, Gender.Feminine, ["", "taa"]);

    this.verbTable.add(Tense.Perfect, Person.First, NumberType.Plural, Gender.Masculine, ["", "naa"]);
    this.verbTable.add(Tense.Perfect, Person.Second, NumberType.Plural, Gender.Masculine, ["", "tum"]);
    this.verbTable.add(Tense.Perfect, Person.Second, NumberType.Plural, Gender.Feminine, ["", "tunna"]);
    this.verbTable.add(Tense.Perfect, Person.Third, NumberType.Plural, Gender.Masculine, ["", "uu"]);
    this.verbTable.add(Tense.Perfect, Person.Third, NumberType.Plural, Gender.Feminine, ["", "na"]);

    // PRESENT
    this.verbTable.add(Tense.Present, Person.First, NumberType.Singular, Gender.Masculine, ["a", "", "u"]);
    this.verbTable.add(Tense.Present, Person.Second, NumberType.Singular, Gender.Masculine, ["ta", "", "u"]);
    this.verbTable.add(Tense.Present, Person.Second, NumberType.Singular, Gender.Feminine, ["ta", "ee", "na"]);
    this.verbTable.add(Tense.Present, Person.Third, NumberType.Singular, Gender.Masculine, ["ya", "", "u"]);
    this.verbTable.add(Tense.Present, Person.Third, NumberType.Singular, Gender.Feminine, ["ta", "", "u"]);

    this.verbTable.add(Tense.Present, Person.Second, NumberType.Dual, Gender.Masculine, ["ta", "aa", "ni"]);
    this.verbTable.add(Tense.Present, Person.Second, NumberType.Dual, Gender.Feminine, ["ta", "aa", "ni"]);
    this.verbTable.add(Tense.Present, Person.Third, NumberType.Dual, Gender.Masculine, ["ya", "aa", "ni"]);
    this.verbTable.add(Tense.Present, Person.Third, NumberType.Dual, Gender.Feminine, ["ta", "aa", "ni"]);

    this.verbTable.add(Tense.Present, Person.First, NumberType.Plural, Gender.Masculine, ["na", "", "u"]);
    this.verbTable.add(Tense.Present, Person.Second, NumberType.Plural, Gender.Masculine, ["ta", "oo", "na"]);
    this.verbTable.add(Tense.Present, Person.Second, NumberType.Plural, Gender.Feminine, ["ta", "na", ""]);
    this.verbTable.add(Tense.Present, Person.Third, NumberType.Plural, Gender.Masculine, ["ya", "oo", "na"]);
    this.verbTable.add(Tense.Present, Person.Third, NumberType.Plural, Gender.Feminine, ["ya", "na", ""]);
  }

  /* ========= Generate ========= */

  generate(
    root: string,
    tense: Tense,
    person: Person,
    num: NumberType,
    gender: Gender,
    form: FormNumber = "1",
    stem: string = "a",
    mood: Mood = Mood.Indicative,
    voice: Voice = Voice.Active,
  ): string {
    const [r1, r2, r3] = root.split("-");

    const formMap: Record<FormNumber, any> = {
      "1": () => this.form1(r1, r2, r3, stem, tense, voice),
      "2": () => this.form2(r1, r2, r3, tense, voice),
      "3": () => this.form3(r1, r2, r3, tense, voice),
      "4": () => this.form4(r1, r2, r3, tense, voice),
      "5": () => this.form5(r1, r2, r3, tense, voice),
      "6": () => this.form6(r1, r2, r3, tense, voice),
      "7": () => this.form7(r1, r2, r3, tense, voice),
      "8": () => this.form8(r1, r2, r3, tense, voice),
      "9": () => this.form9(r1, r2, r3),
      "10": () => this.form10(r1, r2, r3, tense, voice),
    };

    const base = formMap[form]();
    const affixes = this.verbTable.get(tense, person, num, gender);

    const prefix = affixes[0];
    const suffix = affixes[1];
    const moodSuffix = tense === Tense.Perfect ? "" : this.moodMarker(mood, affixes[2]!);

    return prefix + base + suffix + moodSuffix;
  }

  generateAll(root: string): Record<string, string> {
    const allForms: Record<string, string> = {};

    for (const tense of Object.values(Tense)) {
      for (const person of Object.values(Person)) {
        for (const num of Object.values(NumberType)) {
          for (const gender of Object.values(Gender)) {
            for (const mood of Object.values(Mood)) {
              for (const voice of Object.values(Voice)) {
                try {
                  const key = [tense, person, num, gender, mood, voice].join("-");

                  allForms[key] = this.generate(
                    root,
                    tense,
                    person,
                    num,
                    gender,
                    "1", // default form (optional)
                    "a", // default stem (optional)
                    mood,
                    voice,
                  );
                } catch (err) {
                  break; // same behavior as your Python version
                }
              }
            }
          }
        }
      }
    }

    return allForms;
  }
}

const conj = new Conjugate();

console.log(
  conj.generate(
    "q-t-l",
    Tense.Present,
    Person.First,
    NumberType.Singular,
    Gender.Masculine,
    "1",
    "u",
    Mood.Indicative,
    Voice.Active,
  ),
);
console.log(
  conj.generate(
    "q-t-l",
    Tense.Present,
    Person.Third,
    NumberType.Plural,
    Gender.Feminine,
    "1",
    "u",
    Mood.Indicative,
    Voice.Active,
  ),
);
console.log(
  conj.generate(
    "q-t-l",
    Tense.Present,
    Person.First,
    NumberType.Singular,
    Gender.Masculine,
    "10",
    undefined,
    Mood.Indicative,
    Voice.Active,
  ),
);
console.log(
  conj.generate(
    "q-t-l",
    Tense.Present,
    Person.Third,
    NumberType.Plural,
    Gender.Feminine,
    "10",
    undefined,
    Mood.Indicative,
    Voice.Active,
  ),
);
console.log(
  conj.generate(
    "q-t-l",
    Tense.Present,
    Person.Third,
    NumberType.Plural,
    Gender.Feminine,
    "10",
    undefined,
    Mood.Indicative,
    Voice.Passive,
  ),
);
console.log(
  conj.generate(
    "q-t-l",
    Tense.Perfect,
    Person.Third,
    NumberType.Plural,
    Gender.Feminine,
    "2",
    undefined,
    Mood.Indicative,
    Voice.Active,
  ),
);
console.log(
  conj.generate(
    "kh-b-r",
    Tense.Present,
    Person.First,
    NumberType.Singular,
    Gender.Masculine,
    "1",
    "u",
    Mood.Indicative,
    Voice.Active,
  ),
);
console.log(
  conj.generate(
    "kh-b-r",
    Tense.Perfect,
    Person.Third,
    NumberType.Plural,
    Gender.Feminine,
    "1",
    "a",
    Mood.Indicative,
    Voice.Active,
  ),
);
console.log(
  conj.generate(
    "kh-b-r",
    Tense.Present,
    Person.First,
    NumberType.Singular,
    Gender.Masculine,
    "10",
    undefined,
    Mood.Indicative,
    Voice.Active,
  ),
);
console.log(
  conj.generate(
    "kh-b-r",
    Tense.Present,
    Person.Third,
    NumberType.Plural,
    Gender.Feminine,
    "5",
    undefined,
    Mood.Indicative,
    Voice.Active,
  ),
);
console.log(
  conj.generate(
    "kh-b-r",
    Tense.Present,
    Person.Third,
    NumberType.Plural,
    Gender.Feminine,
    "8",
    undefined,
    Mood.Indicative,
    Voice.Passive,
  ),
);
console.log(
  conj.generate(
    "kh-b-r",
    Tense.Perfect,
    Person.Third,
    NumberType.Plural,
    Gender.Feminine,
    "4",
    undefined,
    Mood.Indicative,
    Voice.Active,
  ),
);

console.log(conj.generateAll("k-t-b"));
console.log(conj.generateAll("s-l-m"));
