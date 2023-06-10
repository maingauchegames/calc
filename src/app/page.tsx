"use client";

import classNames from "classnames";
import { useMemo, useState } from "react";
import * as uuid from "uuid";

// Not a great API, but it's the one package I could find that does what I need.
import "nerdamer/Calculus";
import "nerdamer/Algebra";
import "nerdamer/Solve";
import nerdamer from "nerdamer";

type Variable = {
  id: string;
  name: string;
};

function makeVar(label: string): Variable {
  return {
    id: uuid.v4(),
    name: label,
  };
}

function makeVarname(denylist: string[] = []): string {
  const dict = [
    "x",
    "y",
    "z",
    "a",
    "b",
    "c",
    "d",
    "u",
    "v",
    "w",
    "i",
    "j",
    "k",
    "m",
    "n",
    "p",
    "q",
    "r",
    "s",
    "t",
  ];

  for (let suffix = 0; true; suffix++) {
    for (const letter of dict) {
      const label = letter + (suffix === 0 ? "" : suffix);
      if (!denylist.includes(label)) {
        return label;
      }
    }
  }
}

export default function Home() {
  const [formula, setFormula] = useState<string>("");
  const [variables, setVariables] = useState<Variable[]>([
    makeVar(makeVarname()),
  ]);
  const [values, setValues] = useState<Record<string, string>>({
    [variables[0].id]: "0",
  });
  const [hoverId, setHoverId] = useState<string | undefined>(undefined);
  const [wantVarId, setWantVarId] = useState<string | undefined>(undefined);

  const wantVarVal = useMemo<string | undefined>(() => {
    if (wantVarId === undefined) return;
    if (variables.length === 0) return;

    const eqs = [
      formula,
      ...variables
        .filter((v) => v.id !== wantVarId)
        .map((v) => `${v.name} = ${values[v.id]}`),
    ];

    let vals: [string, number][] = [];
    try {
      vals = (nerdamer as any).solveEquations(eqs);
    } catch (e) {
      // ignore solver errors
      return;
    }

    const resultVars = vals.map((entry) => entry[0]);
    const inputVars = variables.map((v) => v.name);
    if (!inputVars.every((v) => resultVars.includes(v))) return;

    const wantName = variables.find((v) => v.id === wantVarId)!.name;
    const wantVal = vals.find((entry) => entry[0] === wantName)![1];
    const strA = wantVal.toString();
    const strB = wantVal.toFixed(4);

    return strA.length < strB.length ? strA : strB;
  }, [formula, variables, values, wantVarId]);

  function remove(id: string) {
    setVariables(variables.filter((x) => x.id !== id));
    if (hoverId === id) setHoverId(undefined);
    if (wantVarId === id) setWantVarId(undefined);
  }

  function add() {
    const newVar = makeVar(makeVarname(variables.map((x) => x.name)));
    setVariables([...variables, newVar]);
    setValues({ ...values, [newVar.id]: "0" });
  }

  function rename(id: string, name: string) {
    var index = variables.findIndex((x) => x.id === id);
    if (index < 0) return;
    variables[index].name = name;
    setVariables([...variables]);
  }

  const rowLayout = "flex flex-row justify-between items-center gap-3 p-2";
  const firstCol = "w-4";

  return (
    <div className="flex w-full h-full items-center justify-center">
      <div className="w-1/2 flex flex-col items-center justify-center">
        <input
          type="text"
          className="w-full border-2 p-2 border-gray-300 rounded-md grow"
          placeholder="Type a formula..."
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
        />

        <div className="w-full mt-4">
          {variables.map((v) => (
            <div
              key={v.id}
              className={classNames(
                rowLayout,
                "border rounded-md",
                hoverId === v.id ? "border-slate-400" : "border-transparent"
              )}
            >
              <div>
                <button
                  className={classNames(
                    firstCol,
                    "text-right",
                    wantVarId === v.id
                      ? "text-black font-bold"
                      : "text-slate-400"
                  )}
                  onMouseEnter={() => wantVarId !== v.id && setHoverId(v.id)}
                  onMouseLeave={() => hoverId === v.id && setHoverId(undefined)}
                  onClick={() => wantVarId !== v.id && setWantVarId(v.id)}
                >
                  {wantVarId === v.id || hoverId === v.id ? "⇨" : "•"}
                </button>
              </div>

              <div className="grow">
                <input
                  type="text"
                  className="w-full m-0 p-2 border-2 border-gray-300 rounded-md text-right"
                  value={v.name}
                  onChange={(e) => rename(v.id, e.target.value)}
                />
              </div>

              {v.id === wantVarId ? (
                <div className="font-bold w-48">{wantVarVal ?? "unknown"}</div>
              ) : (
                <div>
                  <input
                    className="w-48 m-0 p-2 border-2 border-gray-300 rounded-md"
                    value={values[v.id] ?? 0}
                    onChange={(e) =>
                      setValues({ ...values, [v.id]: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="w-8">
                <button
                  className="ml-2 text-sm text-center"
                  onClick={() => remove(v.id)}
                >
                  ⨯
                </button>
              </div>
            </div>
          ))}

          <div className={classNames(rowLayout)}>
            <div className={firstCol} />

            <div className="grow text-left">
              <button onClick={add}>Add variable</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
