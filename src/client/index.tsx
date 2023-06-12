import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";

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

  // We want this to loop until it finds a name that isn't in the denylist.
  // eslint-disable-next-line no-constant-condition
  for (let suffix = 0; true; suffix++) {
    for (const letter of dict) {
      const label = letter + (suffix === 0 ? "" : suffix);
      if (!denylist.includes(label)) {
        return label;
      }
    }
  }
}

const x = makeVar("x");
const y = makeVar("y");
const initialVars = [x, y];
const initialVals = { [x.id]: "3", [y.id]: "0" };
const initialWantId = y.id;
const initialFormula = "x + y = 5";

function App() {
  useEffect(() => {
    document.title = "calc";
  }, []);

  const [formula, setFormula] = useState<string>(initialFormula);
  const [variables, setVariables] = useState<Variable[]>(initialVars);
  const [values, setValues] = useState<Record<string, string>>(initialVals);
  const [hoverId, setHoverId] = useState<string | undefined>(undefined);
  const [wantVarId, setWantVarId] = useState<string | undefined>(initialWantId);

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
      // nerdamer doesn't have great type definitions, so we need the `as any`.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vals = (nerdamer as any).solveEquations(eqs);
    } catch (e) {
      // ignore solver errors
      return;
    }

    const resultVars = vals.map((entry) => entry[0]);
    const inputVars = variables.map((v) => v.name);
    if (!inputVars.every((v) => resultVars.includes(v))) return;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const wantName = variables.find((v) => v.id === wantVarId)!.name;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    const item = variables.find((x) => x.id === id);
    if (item === undefined) {
      return;
    }

    item.name = name;
    setVariables([...variables]);
  }

  const gray300 = "#e2e8f0";
  const slate400 = "#718096";

  const rowStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem",
  };

  const buttonColumnStyle: React.CSSProperties = {
    width: "2rem",
    textAlign: "center",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        fontFamily:
          '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div
        style={{
          position: "relative",
          width: "50%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1 style={{ position: "absolute", top: "-4rem", fontSize: "1.5rem" }}>
          calc
        </h1>

        <input
          type="text"
          style={{
            boxSizing: "border-box",
            width: "100%",
            border: `2px solid ${gray300}`,
            padding: "0.5rem",
            borderRadius: "0.375rem",
            flexGrow: 1,
          }}
          placeholder="Type a formula..."
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
        />

        <div
          style={{
            width: "100%",
            marginTop: "1rem",
          }}
        >
          {variables.map((v) => (
            <div
              key={v.id}
              style={{
                ...rowStyle,
                border: "1px solid transparent",
                borderRadius: "0.375rem",
                borderColor: hoverId === v.id ? slate400 : "transparent",
              }}
            >
              <div
                style={{
                  ...buttonColumnStyle,
                  color: hoverId === v.id ? "black" : slate400,
                  fontWeight: hoverId === v.id ? "bold" : "normal",
                  cursor: "pointer",
                }}
                onMouseEnter={() => wantVarId !== v.id && setHoverId(v.id)}
                onMouseLeave={() => hoverId === v.id && setHoverId(undefined)}
                onClick={() => wantVarId !== v.id && setWantVarId(v.id)}
              >
                {wantVarId === v.id || hoverId === v.id ? "⏵" : "∘"}
              </div>

              <div style={{ flexGrow: 1 }}>
                <input
                  type="text"
                  style={{
                    boxSizing: "border-box",
                    width: "100%",
                    margin: 0,
                    padding: "0.5rem",
                    border: `2px solid ${gray300}`,
                    borderRadius: "0.375rem",
                    textAlign: "right",
                  }}
                  value={v.name}
                  onChange={(e) => rename(v.id, e.target.value)}
                />
              </div>

              <div style={{ width: "30%" }}>
                {v.id === wantVarId ? (
                  <div
                    style={{
                      width: "100%",
                      fontWeight: "bold",
                    }}
                  >
                    {wantVarVal ?? "unknown"}
                  </div>
                ) : (
                  <input
                    style={{
                      boxSizing: "border-box",
                      width: "100%",
                      margin: 0,
                      padding: "0.5rem",
                      border: `2px solid ${gray300}`,
                      borderRadius: "0.375rem",
                    }}
                    value={values[v.id] ?? 0}
                    onChange={(e) =>
                      setValues({ ...values, [v.id]: e.target.value })
                    }
                  />
                )}
              </div>

              <div
                style={{
                  ...buttonColumnStyle,
                  fontSize: "0.875rem",
                }}
                onClick={() => remove(v.id)}
              >
                ⨯
              </div>
            </div>
          ))}

          <div style={rowStyle}>
            <div style={buttonColumnStyle} />

            <div style={{ flexGrow: 1, textAlign: "left" }}>
              <button onClick={add}>Add variable</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById("app");
if (container === null) {
  throw new Error("No container");
}

const root = createRoot(container);
root.render(<App />);
