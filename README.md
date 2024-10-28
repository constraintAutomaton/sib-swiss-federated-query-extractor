# sib-swiss-federated-query-extractor

An extractor of federated queries from the [sib-swiss/sparql-examples](https://github.com/sib-swiss/sparql-examples) repository.
The latest extractor run results are [available online](./sib-swiss-federated-queries.json); however, the results are updated with the changes in [sib-swiss/sparql-examples](https://github.com/sib-swiss/sparql-examples).

## Dependencies
- [Riot](https://jena.apache.org/documentation/io/) or [Raptor](https://librdf.org/raptor/) for the generation of the query dataset of [sib-swiss/sparql-examples](https://github.com/sib-swiss/sparql-examples)
- [Node.js](https://nodejs.org/en)

## Installation
To extract the queries the [sib-swiss/sparql-examples](https://github.com/sib-swiss/sparql-examples) is added as a submodules,
thus, it is important to make sure that it is [correctly fetched](https://git-scm.com/book/en/v2/Git-Tools-Submodules).
For reproducibility, it is crucial to consider which commit is materialized in the repository.
Commit information is added as metadata in the generated file.

To produce the sib-swiss/sparql-examples first run

```sh
./init.sh
```

and then
```sh
yarn install
```

To install the repository dependencies.

## Generate the federated queries

Run 

```sh
yarn run extract-federated-queries
```

to produce the `./sib-swiss-federated-queries.json`, with this format.

```json
{
  "https://purl.expasy.org/sparql-examples/ontology#neXtProt/NXQ_00266": {
    "query": "PREFIX : <http://nextprot.org/rdf/>\nPREFIX cco: <http://rdf.ebi.ac.uk/terms/chembl#>\nPREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\nPREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\nPREFIX sachem: <http://bioinfo.uochb.cas.cz/rdf/v1.0/sachem#>\nPREFIX skos: <http://www.w3.org/2004/02/skos/core#>\n\nSELECT distinct ?entry (group_concat(distinct str(?gomflab); SEPARATOR = \",\") as ?gomfx) WHERE {\n\tSERVICE <https://idsm.elixir-czech.cz/sparql/endpoint/idsm> {\n\t\tSERVICE <https://idsm.elixir-czech.cz/sparql/endpoint/cco> {\n\t\t ?compound sachem:substructureSearch [ sachem:query \"CC12CCC3C(C1CCC2O)CCC4=C3C=CC(=C4)O\" ] . # smiles chain for estradiol\n\t\t}\n\t\t?ACTIVITY rdf:type cco:Activity;\n\t\tcco:hasMolecule ?compound;\n\t\tcco:hasAssay ?ASSAY.\n\t\t?ASSAY cco:hasTarget ?TARGET.\n\t\t?TARGET cco:hasTargetComponent ?COMPONENT.\n\t\t?TARGET cco:taxonomy <http://identifiers.org/taxonomy/9606> . # human protein target\n\t\t?COMPONENT cco:targetCmptXref ?UNIPROT.\n\t\t#?UNIPROT rdf:type cco:UniprotRef.\n\t\tfilter(contains(str(?UNIPROT),\"uniprot\"))\n\t}\n\n\t?entry skos:exactMatch ?UNIPROT.\n\t?entry :isoform ?iso.\n\t?iso :goMolecularFunction / :term ?gomf .\n\t?gomf rdfs:label ?gomflab .\n}\n\nGROUP BY ?entry",
    "description": "Proteins binding estradiol and/or similar molecules (substructure search with SMILES) and their associated GO_MF terms",
    "federatedEndpoint": [
      "https://idsm.elixir-czech.cz/sparql/endpoint/idsm",
      "https://idsm.elixir-czech.cz/sparql/endpoint/cco"
    ]
  }...
  "metadata":{
    // UNIX date when this data was generated
    "date": 1730118595470,
    // commit where the data from https://github.com/sib-swiss/sparql-examples was produced
    "commit" : "436f604"
  }
}
```
