pushd ./sib-swiss-query-examples
    ./convertToOneTurtle.sh -p all
    mv ./examples_all.ttl ../all_queries.ttl
popd