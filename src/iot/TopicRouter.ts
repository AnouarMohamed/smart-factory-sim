/**
 * MQTT topic matching with single-level and multi-level wildcards.
 */

export class TopicRouter {
  /** Return true when a topic matches an MQTT topic filter. */
  public matches(filter: string, topic: string): boolean {
    const filterParts = filter.split('/');
    const topicParts = topic.split('/');

    for (let index = 0; index < filterParts.length; index += 1) {
      const filterPart = filterParts[index];
      const topicPart = topicParts[index];

      if (filterPart === '#') {
        return true;
      }

      if (topicPart === undefined) {
        return false;
      }

      if (filterPart !== '+' && filterPart !== topicPart) {
        return false;
      }
    }

    return filterParts.length === topicParts.length;
  }
}

