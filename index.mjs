import { QueryEngine } from '@comunica/query-sparql-file';
import { writeFileSync } from 'fs';
import { exec } from 'child_process';

const myEngine = new QueryEngine();

const query = `
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX spex: <https://purl.expasy.org/sparql-examples/ontology#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?queryID ?federatedEndpoint ?comment ?query  WHERE {
  {
    SELECT ?queryID WHERE {
      ?queryID spex:federatesWith ?federatedEndpoint .
    }
    GROUP BY ?queryID
    HAVING (COUNT(?federatedEndpoint) > 1)
  }
  ?queryID sh:select ?query .
  ?queryID spex:federatesWith ?federatedEndpoint .
  ?queryID rdfs:comment ?comment .
}`;
const bindingsStream = await myEngine.queryBindings(query, {
    sources: ['./all_queries.ttl'],
});

const bindings = await bindingsStream.toArray();
const federatedQueryReport = {};

for (const binding of bindings) {
    const queryID = binding.get('queryID').value;
    const query = binding.get('query').value;
    const description = binding.get('comment').value;
    const federatedEndpoint = binding.get('federatedEndpoint').value;
    if (federatedQueryReport[queryID] !== undefined) {
        federatedQueryReport[queryID]["federatedEndpoint"].push(federatedEndpoint);
    } else {
        federatedQueryReport[queryID] = {
            query,
            description,
            federatedEndpoint: [federatedEndpoint]
        }
    }
}
console.log(`There is ${Object.keys(federatedQueryReport).length} federated queries in the current sib-swiss example repository`);

const getCurrentCommitSibCommand = 'cd ./sib-swiss-query-examples && git rev-parse --short HEAD';

exec(getCurrentCommitSibCommand, (error, stdout, stderr) => {
  if (error) {
    throw new Error(`Error executing command: ${error.message}`);
  }

  if (stderr) {
    throw new Error(`Standard Error: ${stderr}`);
  }
  federatedQueryReport["metadata"] = {
    "date":Date.now(),
    "commit": stdout.replace("\n", "")
  };
  writeFileSync("./sib-swiss-federated-queries.json", JSON.stringify(federatedQueryReport, null, 2));
});


