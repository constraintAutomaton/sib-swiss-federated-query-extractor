import { QueryEngine } from '@comunica/query-sparql-file';
import { writeFileSync } from 'fs';
import { exec } from 'child_process';

const myEngine = new QueryEngine();

const query = `
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX spex: <https://purl.expasy.org/sparql-examples/ontology#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?queryID ?federatedEndpoint ?comment ?query ?target  WHERE {
  ?queryID sh:select ?query .
  ?queryID spex:federatesWith ?federatedEndpoint .
  ?queryID rdfs:comment ?comment .
  ?queryID <https://schema.org/target> ?target
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
    const target = binding.get('target').value;
    if (federatedQueryReport[queryID] !== undefined) {
      federatedQueryReport[queryID]["federatedEndpoint"].push(target);
        federatedQueryReport[queryID]["federatedEndpoint"].push(federatedEndpoint);
    } else {
        federatedQueryReport[queryID] = {
            query,
            description,
            federatedEndpoint: [target, federatedEndpoint]
        }
    }
}
const nQueries = Object.keys(federatedQueryReport).length;
console.log(`There is ${nQueries} federated queries in the current sib-swiss example repository`);

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
    "commit": stdout.replace("\n", ""),
    "number_of_queries": nQueries
  };
  writeFileSync("./sib-swiss-federated-queries.json", JSON.stringify(federatedQueryReport, null, 2));
});



