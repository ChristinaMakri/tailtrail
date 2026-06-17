-- RPC called by find-matches edge function
CREATE OR REPLACE FUNCTION find_similar_pets(
  query_embedding     VECTOR(512),
  query_lat           DOUBLE PRECISION,
  query_lng           DOUBLE PRECISION,
  pet_type            TEXT,
  similarity_threshold FLOAT,
  radius_km           INTEGER,
  max_results         INTEGER
)
RETURNS TABLE (
  id             UUID,
  user_id        UUID,
  similarity     FLOAT,
  distance_km    FLOAT
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    p.id,
    p.user_id,
    1 - (p.embedding <=> query_embedding) AS similarity,
    (
      6371 * acos(
        LEAST(1.0,
          cos(radians(query_lat)) * cos(radians(p.location_lat)) *
          cos(radians(p.location_lng) - radians(query_lng)) +
          sin(radians(query_lat)) * sin(radians(p.location_lat))
        )
      )
    ) AS distance_km
  FROM pets p
  WHERE
    p.type = pet_type
    AND p.status = 'active'
    AND p.embedding_ready = TRUE
    AND 1 - (p.embedding <=> query_embedding) >= similarity_threshold
    AND (
      6371 * acos(
        LEAST(1.0,
          cos(radians(query_lat)) * cos(radians(p.location_lat)) *
          cos(radians(p.location_lng) - radians(query_lng)) +
          sin(radians(query_lat)) * sin(radians(p.location_lat))
        )
      )
    ) <= radius_km
  ORDER BY
    (1 - (p.embedding <=> query_embedding)) * 0.7
    + (1 - LEAST(
        6371 * acos(
          LEAST(1.0,
            cos(radians(query_lat)) * cos(radians(p.location_lat)) *
            cos(radians(p.location_lng) - radians(query_lng)) +
            sin(radians(query_lat)) * sin(radians(p.location_lat))
          )
        ) / radius_km, 1.0
      )) * 0.3
    DESC
  LIMIT max_results;
$$;
