import {
  isEqual,
  omit,
  keys,
  map,
  find,
  reduce
} from 'lodash';


function getLabelPairs(metric) {
  const pairs = map(omit(metric, 'value'), (v, k) => `${k}="${v}"`);
  return pairs.length === 0 ? '' : `${pairs.join(',')}`;
}

export function formatHistogramOrSummary(name, metric, bucketLabel = 'le') {
  let str = '';
  const labels = getLabelPairs(metric);
  if (labels) {
    str += `${name}_count{${labels}} ${metric.value.count}\n`;
    str += `${name}_sum{${labels}} ${metric.value.sum}\n`;
  } else {
    str += `${name}_count ${metric.value.count}\n`;
    str += `${name}_sum ${metric.value.sum}\n`;
  }


  return reduce(metric.value.entries, (result, count, bucket) => {
    if (labels) {
      str += `${name}_bucket{${bucketLabel}="${bucket}",${labels}} ${count}\n`;
    } else {
      str += `${name}_bucket{${bucketLabel}="${bucket}"} ${count}\n`;
    }

    return str;
  }, str);
}


export function findExistingMetric(labels, values) {
  // If there are no labels, there can only be one metric
  if (!labels) {
    return values[0];
  }
  return find(values, v => isEqual(omit(v, 'value'), labels));
}

export function formatCounterOrGauge(name, metric) {
  const value = ` ${metric.value.toString()}`;
  // If there are no keys on `metric`, it doesn't have a label;
  // return the count as a string.
  if (keys(metric).length === 1 && typeof metric.value === 'number') {
    return `${name}${value}\n`;
  }
  const pair = map(omit(metric, 'value'), (v, k) => `${k}="${v}"`);
  return `${name}{${pair.join(',')}}${value}\n`;
}
