mkdir target
wget "https://github.com/sib-swiss/sparql-examples-utils/releases/download/v2.0.11/sparql-examples-utils-2.0.11-uber.jar"
mv sparql-examples-utils-2.0.11-uber.jar target

pushd ./sib-swiss-query-examples
    java -jar ../target/sparql-examples-utils-2.0.11-uber.jar convert -i examples/ -p all -f ttl > ../all_queries.ttl
popd