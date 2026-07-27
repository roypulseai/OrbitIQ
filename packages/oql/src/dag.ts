import { ASTNode } from "./parser";

interface MeasureDefinition {
  name: string;
  expression: ASTNode;
  dependencies: Set<string>;
}

export interface DAGValidationResult {
  valid: boolean;
  circularReferences: string[];
  executionOrder: string[];
  dependencyGraph: Map<string, string[]>;
}

/**
 * Measures the DAG (Directed Acyclic Graph) of OQL measure dependencies.
 * Detects circular references and provides topological ordering for compilation.
 */
export class MeasureDAG {
  private measures: Map<string, MeasureDefinition> = new Map();

  addMeasure(name: string, expression: ASTNode): void {
    const dependencies = this.extractDependencies(expression);
    this.measures.set(name.toUpperCase(), {
      name: name.toUpperCase(),
      expression,
      dependencies,
    });
  }

  removeMeasure(name: string): void {
    this.measures.delete(name.toUpperCase());
  }

  getMeasure(name: string): MeasureDefinition | undefined {
    return this.measures.get(name.toUpperCase());
  }

  getAllMeasureNames(): string[] {
    return Array.from(this.measures.keys());
  }

  /**
   * Extract all [MeasureName] references from an AST node.
   */
  private extractDependencies(node: ASTNode): Set<string> {
    const deps = new Set<string>();

    const walk = (n: ASTNode) => {
      switch (n.type) {
        case "IDENTIFIER":
          // Check if it looks like a measure reference (starts with [ or is a known measure)
          if (n.name.startsWith("[") && n.name.endsWith("]")) {
            deps.add(n.name.slice(1, -1).toUpperCase());
          }
          break;
        case "BINARY":
          walk(n.left);
          walk(n.right);
          break;
        case "UNARY":
          walk(n.operand);
          break;
        case "COLUMN":
          walk(n.expression);
          break;
        case "AGGREGATE":
          walk(n.expression);
          break;
        case "FUNCTION":
          n.arguments.forEach(walk);
          break;
        case "CALCULATE":
          walk(n.expression);
          n.filterModifiers.forEach((m) => {
            if (m.condition) walk(m.condition);
          });
          break;
        case "WINDOW":
          if (n.expression) walk(n.expression);
          n.partitionBy.forEach(walk);
          n.orderBy.forEach((o) => walk(o.expression));
          break;
        case "TIME_INTEL":
          walk(n.dateColumn);
          n.arguments.forEach(walk);
          break;
        case "IF":
          walk(n.condition);
          walk(n.trueExpr);
          if (n.falseExpr) walk(n.falseExpr);
          break;
        case "SWITCH":
          if (n.expression) walk(n.expression);
          n.cases.forEach((c) => { walk(c.value); walk(c.result); });
          if (n.default) walk(n.default);
          break;
        case "METRIC":
          // METRIC keyword references — check if it's a known measure
          if (this.measures.has(n.name.toUpperCase())) {
            deps.add(n.name.toUpperCase());
          }
          break;
      }
    };

    walk(node);
    return deps;
  }

  /**
   * Validate the DAG: detect circular references and compute execution order.
   */
  validate(): DAGValidationResult {
    const circularReferences: string[] = [];
    const dependencyGraph = new Map<string, string[]>();
    const visited = new Set<string>();
    const inStack = new Set<string>();
    const executionOrder: string[] = [];

    for (const [name, measure] of this.measures) {
      dependencyGraph.set(name, Array.from(measure.dependencies));
    }

    const visit = (name: string, path: string[]): boolean => {
      if (inStack.has(name)) {
        // Found a cycle
        const cycleStart = path.indexOf(name);
        const cycle = path.slice(cycleStart).concat(name);
        circularReferences.push(cycle.join(" → "));
        return false;
      }

      if (visited.has(name)) {
        return true;
      }

      visited.add(name);
      inStack.add(name);
      path.push(name);

      const measure = this.measures.get(name);
      if (measure) {
        for (const dep of measure.dependencies) {
          if (!visit(dep, [...path])) {
            return false;
          }
        }
      }

      inStack.delete(name);
      path.pop();
      executionOrder.push(name);
      return true;
    };

    for (const name of this.measures.keys()) {
      if (!visited.has(name)) {
        visit(name, []);
      }
    }

    // Post-order DFS naturally puts dependencies before dependents
    // (since we iterate all measures and unvisited nodes are visited first)

    return {
      valid: circularReferences.length === 0,
      circularReferences,
      executionOrder,
      dependencyGraph,
    };
  }

  /**
   * Get direct dependencies of a measure.
   */
  getDependencies(measureName: string): string[] {
    const measure = this.measures.get(measureName.toUpperCase());
    return measure ? Array.from(measure.dependencies) : [];
  }

  /**
   * Get all transitive dependencies of a measure (everything it depends on).
   */
  getTransitiveDependencies(measureName: string): Set<string> {
    const allDeps = new Set<string>();
    const queue = [measureName.toUpperCase()];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const deps = this.getDependencies(current);

      for (const dep of deps) {
        if (!allDeps.has(dep)) {
          allDeps.add(dep);
          queue.push(dep);
        }
      }
    }

    return allDeps;
  }

  /**
   * Get all measures that depend on a given measure (reverse dependencies).
   */
  getDependents(measureName: string): string[] {
    const target = measureName.toUpperCase();
    const dependents: string[] = [];

    for (const [name, measure] of this.measures) {
      if (measure.dependencies.has(target)) {
        dependents.push(name);
      }
    }

    return dependents;
  }

  /**
   * Export the DAG as a JSON-serializable structure.
   */
  toJSON(): Record<string, { expression: string; dependencies: string[] }> {
    const result: Record<string, { expression: string; dependencies: string[] }> = {};

    for (const [name, measure] of this.measures) {
      result[name] = {
        expression: JSON.stringify(measure.expression),
        dependencies: Array.from(measure.dependencies),
      };
    }

    return result;
  }
}
